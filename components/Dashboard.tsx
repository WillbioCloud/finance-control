import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from '../types';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Wallet, 
  Trophy, 
  Bell 
} from 'lucide-react-native';
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
  transactions, 
  goals, 
  cards, 
  userProfile, 
  categories, 
  onDeleteTransaction,
  onNavigate 
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // --- CÁLCULOS ---
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
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);

    return { data: data.slice(0, 5), totalExpenses };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View className="flex-1 bg-slate-50">
      
      {/* --- CABEÇALHO (NOVO) --- */}
      <View className="flex-row justify-between items-center mb-6 px-1">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
            <Image 
              source={{ uri: userProfile.avatar || 'https://github.com/shadcn.png' }} 
              className="w-full h-full"
            />
          </View>
          <View>
            <Text className="text-slate-500 text-xs font-medium">Bem-vindo(a),</Text>
            <Text className="text-slate-800 text-xl font-bold">{userProfile.name.split(' ')[0]}</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-white p-2.5 rounded-full border border-slate-100 shadow-sm">
          <Bell size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* --- CARD PRINCIPAL (SALDO) --- */}
      <View className="bg-emerald-600 rounded-[2rem] p-6 shadow-xl shadow-emerald-900/20 relative overflow-hidden mb-8">
        {/* Efeitos de Fundo */}
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <View className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl" />

        <View className="z-10">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Saldo Atual</Text>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)} className="bg-black/10 p-2 rounded-full">
               {showBalance ? <Eye size={16} color="white" /> : <EyeOff size={16} color="white" />}
            </TouchableOpacity>
          </View>
          
          <Text className="text-4xl font-bold text-white mb-6">
            {showBalance ? `R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}
          </Text>

          <View className="flex-row gap-3">
            {/* Entrada */}
            <View className="flex-1 bg-white/10 p-3 rounded-2xl flex-row items-center gap-3 border border-white/5">
              <View className="w-8 h-8 rounded-full bg-emerald-400/20 items-center justify-center">
                <TrendingUp size={16} color="#6ee7b7" />
              </View>
              <View>
                <Text className="text-emerald-100/70 text-[10px] uppercase font-bold">Entradas</Text>
                <Text className="font-bold text-sm text-white">
                   {showBalance ? `R$ ${stats.income.toLocaleString()}` : '•••'}
                </Text>
              </View>
            </View>

            {/* Saída */}
            <View className="flex-1 bg-white/10 p-3 rounded-2xl flex-row items-center gap-3 border border-white/5">
              <View className="w-8 h-8 rounded-full bg-rose-400/20 items-center justify-center">
                <TrendingDown size={16} color="#fda4af" />
              </View>
              <View>
                <Text className="text-rose-100/70 text-[10px] uppercase font-bold">Saídas</Text>
                <Text className="font-bold text-sm text-white">
                   {showBalance ? `R$ ${stats.expenses.toLocaleString()}` : '•••'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* --- GRÁFICO DE DESPESAS --- */}
      <View className="mb-8">
        <View className="flex-row justify-between items-end mb-4 px-1">
           <Text className="font-bold text-slate-800 text-lg">Resumo de Gastos</Text>
           <Text className="text-slate-400 text-xs font-medium">Este mês</Text>
        </View>
        
        <View className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex-row items-center">
            {/* Gráfico */}
            <View className="items-center justify-center mr-6">
               <DonutChart 
                  radius={50} 
                  strokeWidth={10} 
                  data={chartData.data} 
                  totalValue={`R$ ${Math.floor(chartData.totalExpenses / 1000)}k`} 
               />
            </View>

            {/* Legenda Organizada */}
            <View className="flex-1 justify-center gap-3">
               {chartData.data.length > 0 ? (
                 chartData.data.map((item, index) => (
                   <View key={index} className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2 flex-1">
                         <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                         <Text className="text-xs font-semibold text-slate-600" numberOfLines={1}>{item.name}</Text>
                      </View>
                      <Text className="text-xs font-bold text-slate-800">{item.percentage.toFixed(0)}%</Text>
                   </View>
                 ))
               ) : (
                 <Text className="text-slate-400 text-xs italic text-center">Sem dados de despesas.</Text>
               )}
            </View>
        </View>
      </View>

      {/* --- METAS (Horizontal) --- */}
      {goals.length > 0 && (
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="font-bold text-slate-800 text-lg">Minhas Metas</Text>
            <TouchableOpacity onPress={() => onNavigate('goals')} className="flex-row items-center gap-1">
               <Text className="text-blue-500 text-xs font-bold">Ver todas</Text>
               <ArrowRight size={12} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 4 }}>
            {goals.map(goal => {
               const perc = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
               return (
                 <View key={goal.id} className="bg-white w-40 p-4 rounded-[1.5rem] mr-4 border border-slate-100 shadow-sm">
                    <View className="flex-row justify-between items-start mb-3">
                       <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center">
                          <Trophy size={14} color="#3b82f6" />
                       </View>
                       <Text className="text-slate-800 font-bold text-xs bg-slate-50 px-2 py-1 rounded-md">
                         {perc.toFixed(0)}%
                       </Text>
                    </View>
                    
                    <Text className="font-bold text-slate-700 text-sm mb-1 truncate" numberOfLines={1}>{goal.name}</Text>
                    <Text className="text-slate-400 text-[10px] font-bold mb-3">
                       Faltam R$ {(goal.targetAmount - goal.currentAmount).toLocaleString()}
                    </Text>
                    
                    <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <View className="h-full bg-blue-500 rounded-full" style={{ width: `${perc}%` }} />
                    </View>
                 </View>
               );
            })}
          </ScrollView>
        </View>
      )}

      {/* --- CARTÕES (Horizontal) --- */}
      {cards.length > 0 && (
          <View className="mb-8">
            <Text className="font-bold text-slate-800 text-lg mb-4 px-1">Meus Cartões</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 4 }}>
              {cards.map(card => (
                 <View key={card.id} className={`w-72 h-40 p-6 rounded-[1.5rem] ${card.color} mr-4 justify-between relative overflow-hidden shadow-lg shadow-slate-300`}>
                    <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-lg" />
                    
                    <View className="flex-row justify-between items-start">
                       <View>
                          <Text className="text-white font-bold text-lg">{card.name}</Text>
                          <Text className="text-white/70 text-xs font-medium">{card.bank || 'Cartão de Crédito'}</Text>
                       </View>
                       <Wallet color="white" size={24} />
                    </View>

                    <View>
                       <View className="flex-row justify-between items-end mb-1">
                          <Text className="text-white/80 text-[10px] uppercase font-bold tracking-wider">Fatura Atual</Text>
                          <Text className="text-white/80 text-[10px] font-bold">Vence dia {card.dueDay}</Text>
                       </View>
                       <Text className="text-white text-3xl font-bold tracking-tight">
                          R$ {card.used.toLocaleString()}
                       </Text>
                    </View>
                 </View>
              ))}
            </ScrollView>
          </View>
      )}

      {/* --- ÚLTIMAS TRANSAÇÕES --- */}
      <View className="pb-10">
        <Text className="font-bold text-slate-800 text-lg mb-4 px-1">Atividade Recente</Text>
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