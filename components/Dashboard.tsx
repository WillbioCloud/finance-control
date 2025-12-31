import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from '../types';
import { Eye, EyeOff, TrendingUp, AlertCircle, Trophy, ArrowRight } from 'lucide-react-native';
import { TransactionItem } from './TransactionsList';

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
  transactions, 
  goals, 
  cards, 
  userProfile, 
  categories, 
  onDeleteTransaction,
  onNavigate 
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // Cálculos Financeiros
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  // Cálculo de Porcentagem do Orçamento
  const budgetProgress = useMemo(() => {
    if (userProfile.monthlyIncomeLimit <= 0) return 0;
    return Math.min((stats.expenses / userProfile.monthlyIncomeLimit) * 100, 100);
  }, [stats.expenses, userProfile.monthlyIncomeLimit]);

  const recentTransactions = transactions.slice(0, 4);

  // Top Gastos
  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    let total = 0;
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
        total += t.amount;
      });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value, percent: total > 0 ? (value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [transactions]);

  return (
    <View className="space-y-6 pb-6">
      {/* Card Principal: Saldo e Orçamento */}
      <View className="bg-emerald-600 rounded-[2rem] p-6 shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        {/* Decoração de Fundo */}
        <View className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -translate-y-32 translate-x-16 opacity-50" />
        
        <View className="flex-row justify-between items-start z-10">
          <View>
            <Text className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Saldo Atual</Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-4xl font-bold text-white">
                {showBalance ? `R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}
              </Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} className="bg-emerald-700/50 p-1.5 rounded-lg">
                {showBalance ? <Eye size={18} color="white" /> : <EyeOff size={18} color="white" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Barra de Progresso do Orçamento Mensal */}
        <View className="mt-6 z-10">
          <View className="flex-row justify-between mb-2">
             <Text className="text-emerald-100 text-[10px] font-bold uppercase">Consumo Mensal</Text>
             <Text className="text-white text-[10px] font-bold">
               {budgetProgress.toFixed(0)}% de R$ {userProfile.monthlyIncomeLimit.toLocaleString()}
             </Text>
          </View>
          <View className="h-2 bg-emerald-900/30 rounded-full overflow-hidden">
             <View 
                className={`h-full rounded-full ${budgetProgress > 90 ? 'bg-rose-400' : 'bg-emerald-300'}`} 
                style={{ width: `${budgetProgress}%` }} 
             />
          </View>
        </View>

        <View className="mt-6 flex-row gap-3 z-10">
          <View className="flex-1 bg-emerald-800/40 p-3 rounded-2xl border border-emerald-500/20 flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center">
              <TrendingUp size={16} color="#6ee7b7" />
            </View>
            <View>
              <Text className="text-emerald-200 text-[9px] uppercase font-bold">Entradas</Text>
              <Text className="font-bold text-sm text-white">R$ {stats.income.toLocaleString()}</Text>
            </View>
          </View>
          <View className="flex-1 bg-emerald-800/40 p-3 rounded-2xl border border-emerald-500/20 flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-full bg-rose-500/20 items-center justify-center">
              <TrendingUp size={16} color="#fda4af" style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
            <View>
               <Text className="text-rose-200 text-[9px] uppercase font-bold">Saídas</Text>
               <Text className="font-bold text-sm text-white">R$ {stats.expenses.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Widget de Metas (Novo) */}
      {goals.length > 0 && (
        <View>
          <View className="flex-row justify-between items-center mb-3 px-1">
            <Text className="font-bold text-slate-800 text-lg">Minhas Metas</Text>
            <TouchableOpacity onPress={() => onNavigate('goals')} className="flex-row items-center">
               <Text className="text-emerald-600 font-bold text-xs mr-1">Ver todas</Text>
               <ArrowRight size={12} color="#059669" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
            {goals.map(goal => {
               const perc = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
               return (
                 <View key={goal.id} className="bg-white w-40 p-4 rounded-3xl mr-3 border border-slate-100 shadow-sm">
                    <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center mb-2">
                       <Trophy size={14} color="#3b82f6" />
                    </View>
                    <Text className="font-bold text-slate-700 text-sm mb-1" numberOfLines={1}>{goal.name}</Text>
                    <Text className="text-[10px] text-slate-400 font-bold mb-2">
                      R$ {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                    </Text>
                    <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <View className="h-full bg-blue-500 rounded-full" style={{ width: `${perc}%` }} />
                    </View>
                 </View>
               );
            })}
          </ScrollView>
        </View>
      )}

      {/* Cartões (Visual Ajustado) */}
      <View>
        <Text className="font-bold text-slate-800 text-lg mb-3 px-1">Cartões de Crédito</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
          {cards.map(card => {
             const perc = (card.used / card.limit) * 100;
             return (
              <View key={card.id} className={`w-72 h-44 p-6 rounded-[2rem] ${card.color} justify-between mr-4 shadow-sm relative overflow-hidden`}>
                <View className="absolute right-[-20] top-[-20] w-32 h-32 bg-white/10 rounded-full" />
                
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{card.bank}</Text>
                    <Text className="text-white font-bold text-lg">{card.name}</Text>
                  </View>
                  <View className="bg-white/20 px-2 py-1 rounded-md">
                    <Text className="text-white text-[10px] font-bold">Vence dia {card.dueDay}</Text>
                  </View>
                </View>

                <View>
                  <Text className="text-white/70 text-[10px] uppercase font-bold mb-1">Fatura Atual</Text>
                  <Text className="text-white text-3xl font-bold">R$ {card.used.toLocaleString()}</Text>
                  
                  <View className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mt-3 mb-1">
                     <View className="bg-white h-full" style={{ width: `${Math.min(perc, 100)}%` }} />
                  </View>
                  <Text className="text-right text-white/60 text-[10px]">Limite: R$ {card.limit.toLocaleString()}</Text>
                </View>
              </View>
             );
          })}
        </ScrollView>
      </View>

      {/* Estatísticas e Recentes */}
      <View className="flex-row gap-6">
        {/* Top Gastos */}
        <View className="flex-1">
          <Text className="font-bold text-slate-800 text-lg mb-3 px-1">Top Gastos</Text>
          <View className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
            {expenseByCategory.length > 0 ? expenseByCategory.map((cat, idx) => (
              <View key={idx}>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-600 font-bold text-[10px]" numberOfLines={1}>{cat.name}</Text>
                  <Text className="text-slate-400 font-bold text-[10px]">{cat.percent.toFixed(0)}%</Text>
                </View>
                <View className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                  <View className="bg-rose-400 h-full rounded-full" style={{ width: `${cat.percent}%` }} />
                </View>
              </View>
            )) : (
               <View className="items-center py-2">
                 <AlertCircle size={20} color="#cbd5e1" />
                 <Text className="text-slate-300 text-xs mt-1">Sem dados</Text>
               </View>
            )}
          </View>
        </View>
      </View>

      {/* Lista Recentes */}
      <View>
        <View className="flex-row justify-between items-center mb-3 px-1">
          <Text className="font-bold text-slate-800 text-lg">Últimas Transações</Text>
        </View>
        <View className="gap-3">
          {recentTransactions.map(t => (
            <TransactionItem 
              key={t.id} 
              t={t} 
              onDelete={onDeleteTransaction} 
              cat={categories.find(c => c.name === t.category)} 
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default Dashboard;