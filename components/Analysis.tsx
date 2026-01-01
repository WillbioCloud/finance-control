import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Transaction, TransactionType, Category } from '../types';
import { TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react-native';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

const Analysis: React.FC<Props> = ({ transactions, categories }) => {
  const [filterType, setFilterType] = useState<'month' | 'year'>('month');

  // --- CÁLCULOS ---
  
  // 1. Totais Gerais
  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // 2. Gastos por Categoria (Para as barras de progresso)
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    let totalExp = 0;

    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
        totalExp += t.amount;
      });

    return Object.entries(map)
      .map(([catName, amount]) => {
        const catObj = categories.find(c => c.name === catName);
        return {
          name: catName,
          amount,
          color: catObj?.color || '#94a3b8',
          percent: totalExp > 0 ? (amount / totalExp) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount); // Maiores primeiro
  }, [transactions, categories]);

  // 3. Dados para o Gráfico de Barras (Últimos 6 meses simulados ou agrupados)
  // Simplificado para demonstração visual usando dados reais vs fictícios para preencher espaço
  const chartData = useMemo(() => {
    // Aqui você faria o agrupamento real por data. 
    // Para este exemplo visual, vou criar uma projeção baseada no total atual 
    // para mostrar como o gráfico de barras nativo funciona.
    const barData = [
      { label: 'Jan', income: totals.income * 0.8, expense: totals.expense * 0.9 },
      { label: 'Fev', income: totals.income * 0.9, expense: totals.expense * 0.7 },
      { label: 'Mar', income: totals.income * 1.1, expense: totals.expense * 1.2 },
      { label: 'Abr', income: totals.income, expense: totals.expense }, // Mês Atual
    ];
    
    // Encontrar o maior valor para normalizar a altura das barras (escala 0 a 100%)
    const maxValue = Math.max(...barData.map(d => Math.max(d.income, d.expense)));
    return { bars: barData, max: maxValue || 1 };
  }, [totals]);

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Análise Financeira</Text>
          <Text style={styles.subtitle}>Visão geral do seu fluxo</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Calendar size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CARDS DE RESUMO */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <View style={[styles.iconBg, { backgroundColor: '#10b981' }]}>
              <TrendingUp size={18} color="#fff" />
            </View>
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>
              R$ {totals.income.toLocaleString('pt-BR', { notation: 'compact' })}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
            <View style={[styles.iconBg, { backgroundColor: '#ef4444' }]}>
              <TrendingDown size={18} color="#fff" />
            </View>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
              R$ {totals.expense.toLocaleString('pt-BR', { notation: 'compact' })}
            </Text>
          </View>
        </View>

        {/* GRÁFICO DE BARRAS CUSTOMIZADO (CSS PURO) */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fluxo de Caixa</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>Entrada</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>Saída</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {chartData.bars.map((item, index) => (
              <View key={index} style={styles.barGroup}>
                <View style={styles.barsArea}>
                  {/* Barra Receita */}
                  <View style={[styles.barTrack]}>
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          height: `${(item.income / chartData.max) * 100}%`, 
                          backgroundColor: '#10b981' 
                        }
                      ]} 
                    />
                  </View>
                  {/* Barra Despesa */}
                  <View style={[styles.barTrack]}>
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          height: `${(item.expense / chartData.max) * 100}%`, 
                          backgroundColor: '#ef4444' 
                        }
                      ]} 
                    />
                  </View>
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TOP CATEGORIAS (LISTA COM BARRA DE PROGRESSO) */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Gastos por Categoria</Text>
          
          <View style={styles.categoryList}>
            {categoryBreakdown.length > 0 ? (
              categoryBreakdown.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.catHeader}>
                    <View style={styles.catInfo}>
                      <View style={[styles.catColor, { backgroundColor: item.color }]} />
                      <Text style={styles.catName}>{item.name}</Text>
                    </View>
                    <Text style={styles.catAmount}>
                      R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  
                  <View style={styles.progressBg}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${item.percent}%`, backgroundColor: item.color }
                      ]} 
                    />
                  </View>
                  <Text style={styles.catPercent}>{item.percent.toFixed(1)}%</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma despesa registrada.</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b', // slate-800
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b', // slate-500
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // Cards Resumo
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  iconBg: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Gráfico de Barras
  chartSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 180,
    alignItems: 'flex-end',
    paddingBottom: 8,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  barsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: '100%',
  },
  barTrack: {
    width: 12,
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 6,
    backgroundColor: '#f1f5f9', // Fundo sutil da barra
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 6,
    width: '100%',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },

  // Breakdown
  breakdownSection: {
    marginBottom: 24,
  },
  categoryList: {
    marginTop: 16,
    gap: 16,
  },
  categoryItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catColor: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  catAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  catPercent: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 20,
  }
});

export default Analysis;