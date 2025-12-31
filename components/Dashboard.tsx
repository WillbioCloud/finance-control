
import React, { useMemo } from 'react';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from '../types';
import { TrendingUp, TrendingDown, Eye, EyeOff, AlertTriangle, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TransactionItem } from './TransactionsList';

interface Props {
  transactions: Transaction[];
  goals: Goal[];
  cards: CreditCard[];
  userProfile: UserProfile;
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ transactions, goals, cards, userProfile, categories, onDeleteTransaction }) => {
  const [showBalance, setShowBalance] = React.useState(true);

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;
    
    return { income, expenses, balance };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'];

  const incomeAlert = stats.expenses > userProfile.monthlyIncomeLimit * 0.8;

  return (
    <div className="space-y-6 pb-6">
      {/* Balance Card */}
      <div className="bg-emerald-600 dark:bg-emerald-500 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-emerald-100/80 text-sm font-medium mb-1">Saldo Total</p>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold">
                {showBalance ? `R$ ${stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}
              </h2>
              <button onClick={() => setShowBalance(!showBalance)} className="opacity-70 hover:opacity-100 p-1">
                {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
          <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="mt-8 flex gap-4 relative z-10">
          <div className="flex-1 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-emerald-100/70 text-[10px] uppercase font-bold tracking-wider mb-0.5">Receitas</p>
            <p className="font-bold text-sm">R$ {stats.income.toLocaleString()}</p>
          </div>
          <div className="flex-1 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-emerald-100/70 text-[10px] uppercase font-bold tracking-wider mb-0.5">Despesas</p>
            <p className="font-bold text-sm">R$ {stats.expenses.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Smart Alert */}
      {incomeAlert && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-4 rounded-3xl flex items-center gap-3 animate-pulse">
          <div className="bg-rose-100 dark:bg-rose-500/20 p-2 rounded-xl text-rose-600 dark:text-rose-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Limite de Gastos</p>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Você já usou mais de 80% do planejado para o mês.</p>
          </div>
        </div>
      )}

      {/* Recent Transactions - Expandable */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Transações Recentes</h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Ver todas</span>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map(t => (
              <TransactionItem 
                key={t.id} 
                t={t} 
                onDelete={onDeleteTransaction} 
                cat={categories.find(c => c.name === t.category)} 
              />
            ))
          ) : (
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic">
              Nenhuma transação recente
            </div>
          )}
        </div>
      </section>

      {/* Credit Cards Summary */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Cartões</h3>
        </div>
        <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
          {cards.map(card => {
            const perc = (card.used / card.limit) * 100;
            return (
              <div key={card.id} className={`${card.color} min-w-[280px] p-6 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden h-44 flex flex-col justify-between`}>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">{card.name}</p>
                    <p className="text-xl font-bold mt-1">R$ {card.used.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-6 bg-white/20 rounded-md backdrop-blur-md" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{perc.toFixed(0)}% utilizado</span>
                    <span>R$ {card.limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="bg-white h-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ width: `${Math.min(perc, 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Spending Chart */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Distribuição de Gastos</h3>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm h-64 flex flex-col">
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                    color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#1e293b'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-sm italic gap-2">
               <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
              Nenhum gasto registrado ainda.
            </div>
          )}
        </div>
      </section>

      {/* Goals Shortcut */}
      <section className="pb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Metas</h3>
        <div className="space-y-3">
          {goals.map(goal => {
            const perc = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id} className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{goal.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                        R$ {goal.currentAmount.toLocaleString()} de R$ {goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{perc.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.2)]" style={{ width: `${perc}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
