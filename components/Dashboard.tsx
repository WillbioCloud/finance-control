import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from '../types';
import { Eye, EyeOff, TrendingUp, AlertCircle, Trophy, ArrowRight, Wallet } from 'lucide-react-native';
import { TransactionItem } from './TransactionsList';
// Importamos o novo componente
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
  transactions, 
  goals, 
  cards, 
  userProfile, 
  categories, 
  onDeleteTransaction,
  onNavigate 
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // 1. Cálculos Gerais
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  // 2. Preparar dados para o Gráfico de Rosca
  const chartData = useMemo(() => {
    // Agrupa gastos por categoria
    const categoryTotals: Record<string, number> = {};
    let totalExpenses = 0;

    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalExpenses += t.amount;
      });

    // Paleta de cores para o gráfico (Hexadecimal para o SVG funcionar bem)
    const colors = ['#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#64748b'];

    // Transforma em array e ordena
    const data = Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
        color: colors[index % colors.length] // Cicla as cores
      }))
      .sort((a, b) => b.value - a.value); // Maiores primeiro

    return { data: data.slice(0, 5), totalExpenses }; // Pega só top 5
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 4);

  return (
    <View className="space-y-6 pb-6">
      
      {/* --- CARD PRINCIPAL: SALDO --- */}
      <View className="bg-emerald-600 rounded-[2rem] p-6 shadow-lg shadow-emerald-900/20 relative overflow-hidden">
        <View className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full -translate-y-32 translate-x-16 opacity-50" />
        
        <View className="flex-row justify-between items-start z-10 mb-4">
          <View>
            <Text className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Saldo Total</Text>
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

        <View className="flex-row gap-3 z-10">
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

      {/* --- NOVO GRÁFICO DE GASTOS --- */}
      <View>
        <Text className="font-bold text-slate-800 text-lg mb-3 px-1">Resumo de Despesas</Text>
        <View className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-row items-center justify-between">
            
            {/* O Gráfico */}
            <View className="items-center justify-center">
               <DonutChart 
                  radius={55} 
                  strokeWidth={12} 
                  data={chartData.data} 
                  totalValue={`R$ ${Math.floor(chartData.totalExpenses / 1000)}k`} // Ex: R$ 2k
               />
            </View>

            {/* A Legenda */}
            <View className="flex-1 ml-6 gap-3">
               {chartData.data.length > 0 ? (
                 chartData.data.map((item, index) => (
                   <View key={index} className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2 flex-1">
                         <View className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                         <Text className="text-xs font-bold text-slate-600" numberOfLines={1}>{item.name}</Text>
                      </View>
                      <Text className="text-xs font-bold text-slate-800">{item.percentage.toFixed(0)}%</Text>
                   </View>
                 ))
               ) : (
                 <View className="items-center py-4">
                    <Text className="text-slate-400 text-xs">Sem despesas registradas.</Text>
                 </View>
               )}
            </View>

        </View>
      </View>

      {/* --- WIDGET METAS --- */}
      {goals.length > 0 && (
        <View>
          <View className="flex-row justify-between items-center mb-3 px-1">
            <Text className="font-bold text-slate-800 text-lg">Metas</Text>
            <TouchableOpacity onPress={() => onNavigate('goals')} className="flex-row items-center">
               <ArrowRight size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
            {goals.map(goal => {
               const perc = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
               return (
                 <View key={goal.id} className="bg-white w-36 p-4 rounded-3xl mr-3 border border-slate-100 shadow-sm">
                    <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center mb-2">
                       <Trophy size={14} color="#3b82f6" />
                    </View>
                    <Text className="font-bold text-slate-700 text-sm mb-1" numberOfLines={1}>{goal.name}</Text>
                    <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                       <View className="h-full bg-blue-500 rounded-full" style={{ width: `${perc}%` }} />
                    </View>
                 </View>
               );
            })}
          </ScrollView>
        </View>
      )}

      {/* --- CARTÕES (Minimizado) --- */}
      {cards.length > 0 && (
          <View>
            <Text className="font-bold text-slate-800 text-lg mb-3 px-1">Cartões</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
              {cards.map(card => (
                 <View key={card.id} className={`w-64 h-36 p-5 rounded-[1.5rem] ${card.color} mr-3 justify-between relative overflow-hidden`}>
                    <View className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full" />
                    <View className="flex-row justify-between">
                       <Text className="text-white font-bold text-base">{card.name}</Text>
                       <Wallet color="white" size={20} />
                    </View>
                    <View>
                       <Text className="text-white/70 text-[10px] uppercase font-bold">Fatura Atual</Text>
                       <Text className="text-white text-2xl font-bold">R$ {card.used.toLocaleString()}</Text>
                    </View>
                 </View>
              ))}
            </ScrollView>
          </View>
      )}

      {/* --- ÚLTIMAS TRANSAÇÕES --- */}
      <View>
        <Text className="font-bold text-slate-800 text-lg mb-3 px-1">Últimas</Text>
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