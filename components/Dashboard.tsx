import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from '../types';
import { TrendingUp, TrendingDown, Eye, EyeOff, Target } from 'lucide-react-native';
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

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 4);

  // Agrupar gastos por categoria para "gráfico" simples
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
      .slice(0, 5); // Top 5
  }, [transactions]);

  return (
    <View className="space-y-6 pb-6">
      {/* Card de Saldo */}
      <View className="bg-emerald-600 rounded-[2rem] p-6 shadow-lg relative overflow-hidden">
        <View className="flex-row justify-between items-start z-10">
          <View>
            <Text className="text-emerald-100 text-sm font-medium mb-1">Saldo Total</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-3xl font-bold text-white">
                {showBalance ? `R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
              </Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                {showBalance ? <Eye size={20} color="rgba(255,255,255,0.7)" /> : <EyeOff size={20} color="rgba(255,255,255,0.7)" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-6 flex-row gap-4 z-10">
          <View className="flex-1 bg-white/20 p-3 rounded-2xl">
            <Text className="text-emerald-50 text-[10px] uppercase font-bold tracking-wider mb-0.5">Receitas</Text>
            <Text className="font-bold text-sm text-white">R$ {stats.income.toLocaleString()}</Text>
          </View>
          <View className="flex-1 bg-white/20 p-3 rounded-2xl">
            <Text className="text-emerald-50 text-[10px] uppercase font-bold tracking-wider mb-0.5">Despesas</Text>
            <Text className="font-bold text-sm text-white">R$ {stats.expenses.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Atalho Cartões */}
      <View>
        <Text className="font-bold text-slate-800 text-lg mb-3">Meus Cartões</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 pl-1">
          {cards.map(card => {
             const perc = (card.used / card.limit) * 100;
             return (
              <View key={card.id} className={`w-72 h-40 p-5 rounded-3xl ${card.color} justify-between mr-4`}>
                <View className="flex-row justify-between">
                  <Text className="text-white font-bold">{card.name}</Text>
                  <Text className="text-white/80 text-xs">{card.bank}</Text>
                </View>
                <View>
                  <Text className="text-white/70 text-[10px] uppercase font-bold">Fatura Atual</Text>
                  <Text className="text-white text-2xl font-bold">R$ {card.used.toLocaleString()}</Text>
                </View>
                <View className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden mt-2">
                   <View className="bg-white h-full" style={{ width: `${Math.min(perc, 100)}%` }} />
                </View>
              </View>
             );
          })}
        </ScrollView>
      </View>

      {/* Distribuição de Gastos (Substituto do Gráfico) */}
      <View>
        <Text className="font-bold text-slate-800 text-lg mb-3">Top Gastos</Text>
        <View className="bg-white p-5 rounded-3xl gap-4">
          {expenseByCategory.length > 0 ? expenseByCategory.map((cat, idx) => (
            <View key={idx}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-slate-700 font-bold text-xs">{cat.name}</Text>
                <Text className="text-slate-500 font-bold text-xs">{cat.percent.toFixed(0)}%</Text>
              </View>
              <View className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <View className="bg-rose-500 h-full rounded-full" style={{ width: `${cat.percent}%` }} />
              </View>
              <Text className="text-right text-[10px] text-slate-400 mt-0.5">R$ {cat.value.toLocaleString()}</Text>
            </View>
          )) : (
            <Text className="text-slate-400 text-center italic py-4">Nenhum gasto registrado.</Text>
          )}
        </View>
      </View>

      {/* Transações Recentes */}
      <View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="font-bold text-slate-800 text-lg">Recentes</Text>
          <TouchableOpacity onPress={() => onNavigate('transactions')}>
            <Text className="text-emerald-600 font-bold text-xs">Ver todas</Text>
          </TouchableOpacity>
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
          {recentTransactions.length === 0 && (
             <Text className="text-slate-400 text-center italic py-4">Nenhuma transação ainda.</Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default Dashboard;