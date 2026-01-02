import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated,
  Easing,
  FlatList
} from 'react-native';
import { Transaction, TransactionType, Category } from '../types';
import { TrendingUp, TrendingDown, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react-native';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

// --- COMPONENTE DO DIA (COM ANIMAÇÃO) ---
const CalendarDay = ({ day, status, onPress, isSelected }: any) => {
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'mixed') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      colorAnim.setValue(0);
    }
  }, [status]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#10b981', '#8b5cf6', '#ef4444'] 
  });

  let staticBg = '#f1f5f9'; 
  let textColor = '#64748b';

  if (status === 'income') {
    staticBg = '#10b981';
    textColor = '#fff';
  } else if (status === 'expense') {
    staticBg = '#ef4444';
    textColor = '#fff';
  } else if (status === 'mixed') {
    textColor = '#fff';
  }

  const finalStyle = status === 'mixed' ? { backgroundColor } : { backgroundColor: staticBg };

  return (
    <TouchableOpacity onPress={() => onPress(day)} style={styles.dayCellWrapper}>
      <Animated.View style={[
        styles.dayCell, 
        finalStyle, 
        isSelected && styles.daySelectedBorder
      ]}>
        <Text style={[styles.dayText, { color: textColor }]}>{day}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Analysis: React.FC<Props> = ({ transactions, categories }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // --- CÁLCULOS GERAIS (Total Global) ---
  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // --- CÁLCULO REAL DO GRÁFICO (Últimos 4 meses) ---
  const chartData = useMemo(() => {
    const monthsToShow = 4;
    const data = [];
    const today = new Date();

    // 1. Cria a estrutura dos últimos 4 meses
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIndex = d.getMonth(); // 0-11
      const year = d.getFullYear();
      
      // Nome do mês (Jan, Fev...)
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').substring(0, 3);
      const label = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      data.push({
        label,
        monthIndex,
        year,
        income: 0,
        expense: 0
      });
    }

    // 2. Preenche com os valores reais das transações
    transactions.forEach(t => {
      const parts = t.date.split('-'); // Esperado: YYYY-MM-DD
      if (parts.length === 3) {
        const tYear = parseInt(parts[0]);
        const tMonthIndex = parseInt(parts[1]) - 1; // Mês na data é 1-12, array é 0-11

        // Encontra o mês correspondente no gráfico
        const bucket = data.find(d => d.year === tYear && d.monthIndex === tMonthIndex);
        
        if (bucket) {
          if (t.type === TransactionType.INCOME) {
            bucket.income += t.amount;
          } else {
            bucket.expense += t.amount;
          }
        }
      }
    });

    // 3. Define o valor máximo para a escala das barras
    const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense))) || 1;

    return { bars: data, max: maxValue };
  }, [transactions]);

  // --- DADOS DO CALENDÁRIO ---
  const calendarData = useMemo(() => {
    const map: Record<string, { types: Set<string>, list: Transaction[] }> = {};
    transactions.forEach(t => {
      const dateKey = t.date; 
      if (!map[dateKey]) {
        map[dateKey] = { types: new Set(), list: [] };
      }
      map[dateKey].types.add(t.type);
      map[dateKey].list.push(t);
    });
    return map;
  }, [transactions]);

  // Funções do Calendário
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const changeYear = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + increment);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const getDayStatus = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const key = `${year}-${month}-${d}`;

    const data = calendarData[key];
    if (!data) return 'none';
    if (data.types.has(TransactionType.INCOME) && data.types.has(TransactionType.EXPENSE)) return 'mixed';
    if (data.types.has(TransactionType.INCOME)) return 'income';
    if (data.types.has(TransactionType.EXPENSE)) return 'expense';
    return 'none';
  };

  const getDayTransactions = () => {
    if (!selectedDay) return [];
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDay).padStart(2, '0');
    const key = `${year}-${month}-${d}`;
    return calendarData[key]?.list || [];
  };

  // --- CATEGORIAS (Top Gastos) ---
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    let totalExp = 0;
    transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
      totalExp += t.amount;
    });
    return Object.entries(map).map(([name, amount]) => ({
      name, amount, color: categories.find(c => c.name === name)?.color || '#94a3b8',
      percent: totalExp > 0 ? (amount / totalExp) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Análise Financeira</Text>
          <Text style={styles.subtitle}>Visão geral do seu fluxo</Text>
        </View>
        <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.filterButton}>
          <CalendarIcon size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CARDS RESUMO */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <View style={[styles.iconBg, { backgroundColor: '#10b981' }]}>
              <TrendingUp size={18} color="#fff" />
            </View>
            <Text style={styles.summaryLabel}>Receitas Totais</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>
              R$ {totals.income.toLocaleString('pt-BR', { notation: 'compact' })}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
            <View style={[styles.iconBg, { backgroundColor: '#ef4444' }]}>
              <TrendingDown size={18} color="#fff" />
            </View>
            <Text style={styles.summaryLabel}>Despesas Totais</Text>
            <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
              R$ {totals.expense.toLocaleString('pt-BR', { notation: 'compact' })}
            </Text>
          </View>
        </View>

        {/* GRÁFICO REAL */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fluxo de Caixa (4 Meses)</Text>
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
                  {/* Barra Verde (Receita) */}
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${(item.income / chartData.max) * 100}%`, backgroundColor: '#10b981' }]} />
                  </View>
                  {/* Barra Vermelha (Despesa) */}
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${(item.expense / chartData.max) * 100}%`, backgroundColor: '#ef4444' }]} />
                  </View>
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* LISTA DE CATEGORIAS */}
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
                    <Text style={styles.catAmount}>R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
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

      {/* --- MODAL DE CALENDÁRIO --- */}
      <Modal visible={showCalendar} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Calendário</Text>
                <Text style={styles.modalSubtitle}>Histórico diário</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeButton}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarControls}>
              <View style={styles.yearControl}>
                <TouchableOpacity onPress={() => changeYear(-1)}><ChevronLeft size={20} color="#64748b" /></TouchableOpacity>
                <Text style={styles.yearText}>{currentDate.getFullYear()}</Text>
                <TouchableOpacity onPress={() => changeYear(1)}><ChevronRight size={20} color="#64748b" /></TouchableOpacity>
              </View>
              <View style={styles.monthControl}>
                <TouchableOpacity onPress={() => changeMonth(-1)}><ChevronLeft size={24} color="#1e293b" /></TouchableOpacity>
                <Text style={styles.monthText}>
                  {currentDate.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)}><ChevronRight size={24} color="#1e293b" /></TouchableOpacity>
              </View>
            </View>

            <View style={styles.weekDaysGrid}>
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <Text key={i} style={styles.weekDayText}>{d}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCellWrapper} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                return (
                  <CalendarDay 
                    key={day} 
                    day={day} 
                    status={status} 
                    onPress={setSelectedDay}
                    isSelected={selectedDay === day}
                  />
                );
              })}
            </View>

            {selectedDay && (
              <View style={styles.detailsBalloon}>
                <View style={styles.detailsArrow} />
                <Text style={styles.detailsTitle}>
                  Dia {selectedDay} de {currentDate.toLocaleDateString('pt-BR', { month: 'long' })}
                </Text>
                <ScrollView style={styles.detailsList}>
                  {getDayTransactions().length > 0 ? (
                    getDayTransactions().map(t => (
                      <View key={t.id} style={styles.detailItem}>
                        <View style={[styles.detailDot, { backgroundColor: t.type === TransactionType.EXPENSE ? '#ef4444' : '#10b981' }]} />
                        <Text style={styles.detailDesc} numberOfLines={1}>{t.description}</Text>
                        <Text style={[styles.detailAmount, { color: t.type === TransactionType.EXPENSE ? '#ef4444' : '#10b981' }]}>
                          R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noEventsText}>Nada registrado.</Text>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b' },
  filterButton: { padding: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  
  // Summary
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'flex-start' },
  iconBg: { padding: 8, borderRadius: 12, marginBottom: 12 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },

  // Chart
  chartSection: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  legendContainer: { flexDirection: 'row', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', height: 180, alignItems: 'flex-end', paddingBottom: 8 },
  barGroup: { alignItems: 'center', flex: 1, gap: 8 },
  barsArea: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: '100%' },
  barTrack: { width: 12, height: '100%', justifyContent: 'flex-end', borderRadius: 6, backgroundColor: '#f1f5f9', overflow: 'hidden' },
  barFill: { borderRadius: 6, width: '100%' },
  barLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },

  // Breakdown
  breakdownSection: { marginBottom: 24 },
  categoryList: { marginTop: 16, gap: 16 },
  categoryItem: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catColor: { width: 12, height: 12, borderRadius: 4 },
  catName: { fontSize: 14, fontWeight: '600', color: '#334155' },
  catAmount: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  progressBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginBottom: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  catPercent: { fontSize: 10, color: '#94a3b8', textAlign: 'right', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginTop: 20 },

  // Calendar
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  modalSubtitle: { fontSize: 14, color: '#64748b' },
  closeButton: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  calendarControls: { marginBottom: 16 },
  yearControl: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 8 },
  yearText: { fontSize: 16, color: '#64748b', fontWeight: 'bold' },
  monthControl: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24 },
  monthText: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', minWidth: 150, textAlign: 'center' },
  weekDaysGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 8 },
  weekDayText: { width: 40, textAlign: 'center', color: '#94a3b8', fontWeight: 'bold', fontSize: 12 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 4 },
  dayCellWrapper: { width: '13%', aspectRatio: 1, margin: '0.6%', justifyContent: 'center', alignItems: 'center' },
  dayCell: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  daySelectedBorder: { borderWidth: 2, borderColor: '#3b82f6' },
  dayText: { fontSize: 14, fontWeight: 'bold' },
  detailsBalloon: { marginTop: 24, backgroundColor: '#f8fafc', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', flex: 1 },
  detailsArrow: { position: 'absolute', top: -8, alignSelf: 'center', width: 16, height: 16, backgroundColor: '#f8fafc', transform: [{ rotate: '45deg' }], borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#e2e8f0' },
  detailsTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 12, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  detailsList: { flex: 1 },
  detailItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  detailDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  detailDesc: { flex: 1, fontSize: 14, color: '#334155', fontWeight: '500' },
  detailAmount: { fontSize: 14, fontWeight: 'bold' },
  noEventsText: { textAlign: 'center', color: '#cbd5e1', marginTop: 20, fontStyle: 'italic' }
});

export default Analysis;