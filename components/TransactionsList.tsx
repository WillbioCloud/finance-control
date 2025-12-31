
import React, { useState } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { Trash2, Search, Utensils, Car, Coffee, ShoppingBag, Heart, Home, Zap, Wallet, TrendingUp, Smartphone, Plane, AlertCircle, Tag, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  categories: Category[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={20} />,
  Car: <Car size={20} />,
  Coffee: <Coffee size={20} />,
  ShoppingBag: <ShoppingBag size={20} />,
  Heart: <Heart size={20} />,
  Home: <Home size={20} />,
  Zap: <Zap size={20} />,
  Wallet: <Wallet size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  Smartphone: <Smartphone size={20} />,
  Plane: <Plane size={20} />,
  AlertCircle: <AlertCircle size={20} />,
  Tag: <Tag size={20} />
};

export const TransactionItem = ({ t, onDelete, cat }: { t: Transaction, onDelete: (id: string) => void, cat: Category | undefined }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Garante que t.details existe e tem itens para habilitar a expansão
  const hasDetails = Array.isArray(t.details) && t.details.length > 0;

  const handleToggleExpand = () => {
    if (hasDetails) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique expanda o card
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      onDelete(t.id);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800/40 border transition-all duration-300 rounded-3xl overflow-hidden shadow-sm ${isExpanded ? 'border-emerald-500/50 dark:border-emerald-500/30' : 'border-slate-100 dark:border-slate-800'}`}>
      <div 
        className={`p-4 flex items-center justify-between relative group ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={handleToggleExpand}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat?.color || 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'} shadow-sm shrink-0`}>
            {cat ? ICON_MAP[cat.iconName] : <Tag size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{t.description}</p>
              {hasDetails && <Sparkles size={12} className="text-emerald-500 animate-pulse shrink-0" />}
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{t.category} • {t.paymentMethod}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-2 relative z-10">
          <div className="text-right">
            <p className={`font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {hasDetails && (
              <div className="flex justify-end mt-0.5">
                {isExpanded ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-slate-400" />}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleDelete}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
            aria-label="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isExpanded && hasDetails && (
        <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-slate-50 dark:bg-slate-800/50 mb-4 mx-2" />
          <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-emerald-500" />
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Itens detalhados por IA</p>
            </div>
            <div className="space-y-3">
              {t.details?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center px-1 border-b border-slate-100 dark:border-slate-800/50 last:border-0 pb-2 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">
                      {item.quantity ? <span className="text-slate-400 dark:text-slate-500 mr-1.5 font-bold">{item.quantity}</span> : ''}{item.item}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TransactionsList: React.FC<Props> = ({ transactions, onDelete, categories }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filtered.reduce((acc, t) => {
    const date = t.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">Seu Extrato</h3>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" size={18} />
          <input 
            type="text" 
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/50 p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-emerald-500/50 dark:focus:border-emerald-500/20 text-slate-800 dark:text-slate-100 transition-all"
          />
        </div>
      </div>

      <div className="space-y-8 pb-20">
        {sortedDates.length > 0 ? sortedDates.map(date => (
          <div key={date}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-1">
              {new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="space-y-3">
              {grouped[date].map(t => (
                <TransactionItem 
                  key={t.id} 
                  t={t} 
                  onDelete={onDelete} 
                  cat={categories.find(c => c.name === t.category)} 
                />
              ))}
            </div>
          </div>
        )) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-300 dark:text-slate-700" size={24} />
            </div>
            <p className="text-slate-400 dark:text-slate-600 font-medium text-sm italic">
              Nenhuma transação encontrada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
