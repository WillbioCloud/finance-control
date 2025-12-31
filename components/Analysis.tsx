
import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const Analysis: React.FC<Props> = ({ transactions }) => {
  const isDark = document.documentElement.classList.contains('dark');

  const monthlyData = useMemo(() => {
    const data: Record<string, { income: number, expense: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      if (!data[month]) data[month] = { income: 0, expense: 0 };
      
      if (t.type === TransactionType.INCOME) data[month].income += t.amount;
      else data[month].expense += t.amount;
    });

    return Object.entries(data).map(([name, values]) => ({
      name,
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense
    }));
  }, [transactions]);

  const bestMonth = useMemo(() => {
    if (monthlyData.length === 0) return null;
    return monthlyData.reduce((prev, curr) => (curr.balance > prev.balance) ? curr : prev);
  }, [monthlyData]);

  const worstMonth = useMemo(() => {
    if (monthlyData.length === 0) return null;
    return monthlyData.reduce((prev, curr) => (curr.balance < prev.balance) ? curr : prev);
  }, [monthlyData]);

  return (
    <div className="space-y-6 pb-6">
      <h3 className="font-bold text-xl text-slate-800 dark:text-white">Análise Financeira</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-5 rounded-[2rem] shadow-sm">
          <div className="bg-white dark:bg-slate-800 w-9 h-9 rounded-xl flex items-center justify-center text-emerald-500 mb-4 shadow-sm">
            <TrendingUp size={18} />
          </div>
          <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">Melhor Mês</p>
          <p className="font-bold text-lg text-emerald-900 dark:text-emerald-100">{bestMonth ? bestMonth.name : '--'}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-5 rounded-[2rem] shadow-sm">
          <div className="bg-white dark:bg-slate-800 w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 mb-4 shadow-sm">
            <TrendingDown size={18} />
          </div>
          <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-1">Maior Gasto</p>
          <p className="font-bold text-lg text-rose-900 dark:text-rose-100">{worstMonth ? worstMonth.name : '--'}</p>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Ganhos vs Gastos</h4>
          <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5 text-emerald-500"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ganho</div>
            <div className="flex items-center gap-1.5 text-rose-500"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Gasto</div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#475569' : '#94a3b8' }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }} 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#1e293b'
                }} 
              />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={14} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-6 rounded-[2rem]">
        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
          <TrendingUp size={16} /> Insights Inteligentes
        </h4>
        <p className="text-sm text-indigo-800 dark:text-indigo-400/90 leading-relaxed">
          Seu saldo médio subiu <span className="font-bold">12%</span> este mês. Mantendo esse ritmo, você atingirá sua meta de Reserva de Emergência <span className="font-bold">2 meses antes</span> do previsto.
        </p>
      </div>
    </div>
  );
};

export default Analysis;
