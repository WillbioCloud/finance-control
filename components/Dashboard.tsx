import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  Modal, 
  ActivityIndicator 
} from 'react-native';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from '../types';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Wallet, 
  Trophy, 
  Bell, 
  AlertTriangle, 
  ShieldCheck, 
  X 
} from 'lucide-react-native';
import { TransactionItem } from './TransactionsList';
import DonutChart from './DonutChart';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeText } from '../utils/helpers'; // Importação corrigida

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
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAnalyzingAlert, setIsAnalyzingAlert] = useState(false);

  // --- CÁLCULOS FINANCEIROS ---
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

    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalExpenses += t.amount;
      });

    const colors = ['#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#64748b'];

    const data = Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
        color: categories.find(c => c.name === name)?.color || colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);

    return { data: data.slice(0, 5), totalExpenses };
  }, [transactions, categories]);

  const recentTransactions = transactions.slice(0, 5);

  // --- LÓGICA DE PROTEÇÃO (MENSAL) ---
  
  // 1. Verifica se houve "despesa" (depósito) na categoria 'Reserva de Emergência' NESTE MÊS
  const hasDepositThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0 a 11
    const currentYear = now.getFullYear();

    return transactions.some(t => {
      // Verifica se a categoria é a reserva (ignorando acentos/case)
      const isEmergencyCat = normalizeText(t.category) === 'reserva de emergencia';
      
      if (!isEmergencyCat) return false;

      // Verifica a data da transação (YYYY-MM-DD)
      const parts = t.date.split('-');
      if (parts.length !== 3) return false;
      
      const tYear = parseInt(parts[0]);
      const tMonthIndex = parseInt(parts[1]) - 1; // Ajuste pois mês no array começa em 0

      // Retorna true se for no ano e mês atuais
      return tYear === currentYear && tMonthIndex === currentMonth;
    });
  }, [transactions]);

  // 2. Proporção de Gastos (Para cor do card)
  const spendingRatio = stats.income > 0 ? stats.expenses / stats.income : (stats.expenses > 0 ? 1.1 : 0);
  const isDanger = spendingRatio >= 1.0;
  const isWarning = spendingRatio >= 0.75;

  // 3. Cor do Card (Procedural: Verde -> Amarelo -> Vermelho)
  const getCardColor = (ratio: number) => {
    if (ratio >= 1) return '#ef4444'; 
    let r, g, b;
    if (ratio <= 0.75) {
      const t = ratio / 0.75; 
      r = Math.round(16 + (234 - 16) * t);
      g = Math.round(185 + (179 - 185) * t);
      b = Math.round(129 + (8 - 129) * t);
    } else {
      const t = (ratio - 0.75) / 0.25;
      r = Math.round(234 + (239 - 234) * t);
      g = Math.round(179 + (68 - 179) * t);
      b = Math.round(8 + (68 - 8) * t);
    }
    return `rgb(${r}, ${g}, ${b})`;
  };

  const cardBackgroundColor = getCardColor(spendingRatio);

  // 4. Exibe a borda APENAS se fez depósito este mês
  const showProtectionBorder = hasDepositThisMonth;

  // --- LÓGICA DO ALERTA IA ---
  const handleShowAlert = async () => {
    setShowAlertModal(true);
    if (alertMessage) return;

    setIsAnalyzingAlert(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Chave de API não configurada");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const situation = isDanger ? "SALDO NEGATIVO" : "PERTO DO LIMITE";
      
      const prompt = `
        Atue como consultor financeiro. 
        SITUAÇÃO: ${situation} (Gastou ${(spendingRatio * 100).toFixed(0)}% da renda).
        
        DADOS:
        - Renda: R$ ${stats.income.toFixed(2)}
        - Gastos: R$ ${stats.expenses.toFixed(2)}
        - Proteção Mensal (Depósito na Reserva): ${hasDepositThisMonth ? "FEITO ESTE MÊS" : "NÃO FEITO AINDA"}

        TAREFA:
        1. Explique o risco em 1 frase.
        2. Dê uma dica prática baseada na proteção mensal.
      `;

      const result = await model.generateContent(prompt);
      setAlertMessage(result.response.text());

    } catch (error) {
      setAlertMessage("Não foi possível conectar ao consultor IA. Revise seus gastos.");
    } finally {
      setIsAnalyzingAlert(false);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
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
        
        {/* CARD DE SALDO */}
        <View style={[
          styles.balanceCard, 
          { backgroundColor: cardBackgroundColor },
          showProtectionBorder && styles.protectedBorder
        ]}>
          <View style={[styles.bubble, { top: -20, right: -20, width: 120, height: 120 }]} />
          <View style={[styles.bubble, { bottom: -20, left: -20, width: 100, height: 100 }]} />

          {/* Badge de Proteção */}
          {showProtectionBorder && (
            <View style={styles.protectionBadge}>
              <ShieldCheck size={12} color="#fff" />
              <Text style={styles.protectionText}>Protegido este Mês</Text>
            </View>
          )}

          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>SALDO ATUAL</Text>
            
            <View style={{flexDirection: 'row', gap: 8}}>
              {(isWarning || isDanger) && (
                <TouchableOpacity onPress={handleShowAlert} style={styles.alertButton}>
                  <AlertTriangle size={16} color="#fff" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
                {showBalance ? <Eye size={16} color="white" /> : <EyeOff size={16} color="white" />}
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.balanceValue}>
            {showBalance ? `R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <TrendingUp size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.statLabel}>Entradas</Text>
                <Text style={styles.statValue}>
                  {showBalance ? `R$ ${stats.income.toLocaleString()}` : '•••'}
                </Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <TrendingDown size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.statLabel}>Saídas</Text>
                <Text style={styles.statValue}>
                  {showBalance ? `R$ ${stats.expenses.toLocaleString()}` : '•••'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* GRÁFICO */}
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

        {/* METAS */}
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
                // Lógica Visual da Meta Reserva
                const isEmergency = normalizeText(goal.name) === 'reserva de emergencia';
                
                return (
                  <View key={goal.id} style={[styles.goalCard, isEmergency && styles.emergencyGoalCard]}>
                      <View style={styles.goalHeader}>
                        <View style={[styles.goalIcon, isEmergency && { backgroundColor: '#fef3c7' }]}>
                            {isEmergency ? <ShieldCheck size={14} color="#d97706" /> : <Trophy size={14} color="#3b82f6" />}
                        </View>
                        <Text style={[styles.goalPercBadge, isEmergency && { backgroundColor: '#fff', color: '#d97706' }]}>{perc.toFixed(0)}%</Text>
                      </View>
                      
                      <Text style={[styles.goalName, isEmergency && {color: '#fff'}]} numberOfLines={1}>{goal.name}</Text>
                      <Text style={[styles.goalRemaining, isEmergency && {color: 'rgba(255,255,255,0.8)'}]}>
                        Falta R$ {(goal.targetAmount - goal.currentAmount).toLocaleString()}
                      </Text>
                      
                      <View style={[styles.progressBarBg, isEmergency && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <View style={[styles.progressBarFill, { width: `${perc}%` }, isEmergency && { backgroundColor: '#fff' }]} />
                      </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* CARTÕES */}
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

        {/* ÚLTIMAS TRANSAÇÕES */}
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

      {/* MODAL ALERTA IA */}
      <Modal visible={showAlertModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalContent}>
            <View style={styles.alertHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <AlertTriangle size={24} color="#ef4444" />
                <Text style={styles.alertTitle}>Alerta Financeiro</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAlertModal(false)} style={styles.closeButton}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.alertBody}>
              {isAnalyzingAlert ? (
                <View style={{alignItems: 'center', padding: 20}}>
                  <ActivityIndicator size="large" color="#ef4444" />
                  <Text style={{marginTop: 10, color: '#64748b'}}>Analisando situação...</Text>
                </View>
              ) : (
                <Text style={styles.alertText}>{alertMessage}</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4, marginTop: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e2e8f0', borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  welcomeText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  userName: { fontSize: 20, color: '#1e293b', fontWeight: 'bold' },
  notificationButton: { backgroundColor: '#fff', padding: 10, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  scrollContent: { paddingBottom: 32, paddingHorizontal: 16 },
  
  // Balance Card
  balanceCard: { borderRadius: 32, padding: 24, marginBottom: 32, overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  protectedBorder: { borderWidth: 4, borderColor: '#3b82f6' }, // Borda Azul de Proteção
  protectionBadge: { position: 'absolute', top: 8, right: 106, flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 10 },
  protectionText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  bubble: { position: 'absolute', backgroundColor: '#fff', opacity: 0.1, borderRadius: 999 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  balanceLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  eyeButton: { backgroundColor: 'rgba(0,0,0,0.1)', padding: 8, borderRadius: 20 },
  alertButton: { backgroundColor: '#ef4444', padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#fff' },
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
  emergencyGoalCard: { backgroundColor: '#f59e0b', borderColor: '#d97706' }, // Estilo Especial
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
  transactionsGap: { gap: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  alertModalContent: { backgroundColor: '#fff', borderRadius: 24, width: '85%', padding: 24, elevation: 5 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#ef4444' },
  closeButton: { padding: 4 },
  alertBody: { minHeight: 100 },
  alertText: { fontSize: 16, color: '#334155', lineHeight: 24 },
});

export default Dashboard;