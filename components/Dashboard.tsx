import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from '../types';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowRight, Wallet, Trophy, Bell } from 'lucide-react-native';
import { TransactionItem } from './TransactionsList';
import DonutChart from './DonutChart';

interface Props {
  transactions: Transaction[];
  goals: Goal[];
  cards: CreditCard[];
  userProfile: UserProfile;
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<Props> = ({ 
  transactions = [], 
  goals = [], 
  cards = [], 
  userProfile, 
  categories = [], 
  onDeleteTransaction,
  onNavigate 
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // Cálculos
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    let totalExpenses = 0;

    transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalExpenses += t.amount;
    });

    const colors = ['#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#64748b'];
    const data = Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);

    return { data: data.slice(0, 5), totalExpenses };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: userProfile?.avatar || 'https://github.com/shadcn.png' }} 
              style={styles.avatar}
            />
          </View>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
            <Text style={styles.userName}>{userProfile?.name?.split(' ')[0] || 'Usuário'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Card Saldo */}
        <View style={styles.balanceCard}>
          {/* Bolhas decorativas (Simuladas com View) */}
          <View style={[styles.bubble, { top: -20, right: -20, width: 120, height: 120 }]} />
          <View style={[styles.bubble, { bottom: -20, left: -20, width: 100, height: 100 }]} />

          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>SALDO ATUAL</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
              {showBalance ? <Eye size={16} color="white" /> : <EyeOff size={16} color="white" />}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.balanceValue}>
            {showBalance ? `R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <TrendingUp size={16} color="#6ee7b7" />
              </View>
              <View>
                <Text style={styles.statLabel}>Entradas</Text>
                <Text style={styles.statValue}>
                  {showBalance ? `R$ ${stats.income.toLocaleString()}` : '•••'}
                </Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(244, 63, 94, 0.2)' }]}>
                <TrendingDown size={16} color="#fda4af" />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: '#fecdd3' }]}>Saídas</Text>
                <Text style={styles.statValue}>
                  {showBalance ? `R$ ${stats.expenses.toLocaleString()}` : '•••'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gráfico */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resumo de Gastos</Text>
            <Text style={styles.sectionSubtitle}>Este mês</Text>
          </View>
          
          <View style={styles.chartCard}>
              <View style={styles.chartContainer}>
                <DonutChart 
                    radius={50} 
                    strokeWidth={10} 
                    data={chartData.data} 
                    totalValue={chartData.totalExpenses > 0 ? `R$ ${Math.floor(chartData.totalExpenses / 1000)}k` : 'R$ 0'} 
                />
              </View>

              <View style={styles.legendContainer}>
                {chartData.data.length > 0 ? (
                  chartData.data.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={styles.legendLeft}>
                          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                          <Text style={styles.legendText} numberOfLines={1}>{item.name}</Text>
                        </View>
                        <Text style={styles.legendPerc}>{item.percentage.toFixed(0)}%</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Nenhuma despesa registrada.</Text>
                )}
              </View>
          </View>
        </View>

        {/* Metas */}
        {goals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Minhas Metas</Text>
              <TouchableOpacity onPress={() => onNavigate('goals')} style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Ver todas</Text>
                <ArrowRight size={12} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {goals.map(goal => {
                const perc = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
                return (
                  <View key={goal.id} style={styles.goalCard}>
                      <View style={styles.goalHeader}>
                        <View style={styles.goalIcon}>
                            <Trophy size={14} color="#3b82f6" />
                        </View>
                        <Text style={styles.goalPercBadge}>{perc.toFixed(0)}%</Text>
                      </View>
                      
                      <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
                      <Text style={styles.goalRemaining}>
                        Falta R$ {(goal.targetAmount - goal.currentAmount).toLocaleString()}
                      </Text>
                      
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${perc}%` }]} />
                      </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Cartões */}
        {cards.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meus Cartões</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                {cards.map(card => (
                  <View key={card.id} style={[styles.cardItem, { backgroundColor: card.color }]}>
                      <View style={[styles.bubble, { top: -20, right: -20, width: 80, height: 80, opacity: 0.1 }]} />
                      
                      <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardName}>{card.name}</Text>
                            <Text style={styles.cardBank}>{card.bank || 'Cartão'}</Text>
                        </View>
                        <Wallet color="white" size={24} />
                      </View>

                      <View>
                        <View style={styles.cardFooterRow}>
                            <Text style={styles.cardLabel}>Fatura Atual</Text>
                            <Text style={styles.cardLabel}>Vence dia {card.dueDay}</Text>
                        </View>
                        <Text style={styles.cardValue}>
                            R$ {card.used.toLocaleString()}
                        </Text>
                      </View>
                  </View>
                ))}
              </ScrollView>
            </View>
        )}

        {/* Últimas Transações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.transactionsGap}>
            {recentTransactions.map(t => (
              <TransactionItem 
                key={t.id} 
                t={t} 
                onDelete={onDeleteTransaction} 
                cat={categories.find(c => c.name === t.category)} 
              />
            ))}
            {recentTransactions.length === 0 && (
              <Text style={styles.emptyText}>Nenhuma atividade recente.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e2e8f0', borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  welcomeText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  userName: { fontSize: 20, color: '#1e293b', fontWeight: 'bold' },
  notificationButton: { backgroundColor: '#fff', padding: 10, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  scrollContent: { paddingBottom: 32 },
  
  // Balance Card
  balanceCard: { backgroundColor: '#059669', borderRadius: 32, padding: 24, marginBottom: 32, overflow: 'hidden', shadowColor: '#059669', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  bubble: { position: 'absolute', backgroundColor: '#fff', opacity: 0.1, borderRadius: 999 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  balanceLabel: { color: '#d1fae5', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  eyeButton: { backgroundColor: 'rgba(0,0,0,0.1)', padding: 8, borderRadius: 20 },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  iconBg: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  // Sections
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  sectionSubtitle: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  
  // Chart
  chartCard: { backgroundColor: '#fff', padding: 24, borderRadius: 32, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center' },
  chartContainer: { marginRight: 24, alignItems: 'center', justifyContent: 'center' },
  legendContainer: { flex: 1, gap: 12 },
  legendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  legendPerc: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  emptyText: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic', textAlign: 'center', width: '100%' },

  // Goals
  seeAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { color: '#3b82f6', fontSize: 12, fontWeight: 'bold' },
  horizontalScroll: { paddingLeft: 4 },
  goalCard: { backgroundColor: '#fff', width: 160, padding: 16, borderRadius: 24, marginRight: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  goalIcon: { backgroundColor: '#eff6ff', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  goalPercBadge: { color: '#1e293b', fontWeight: 'bold', fontSize: 12, backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  goalName: { fontWeight: 'bold', color: '#334155', fontSize: 14, marginBottom: 4 },
  goalRemaining: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', marginBottom: 12 },
  progressBarBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },

  // Cards
  cardItem: { width: 280, height: 160, padding: 24, borderRadius: 24, marginRight: 16, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardName: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  cardBank: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  cardValue: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  // Transactions
  transactionsGap: { gap: 12 },
});

export default Dashboard;