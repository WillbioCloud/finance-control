
import React, { useState } from 'react';
import { CreditCard as CreditCardType } from '../types';
import { CreditCard, MoreVertical, Plus, X, Landmark, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  cards: CreditCardType[];
  onAddCard: (card: CreditCardType) => void;
}

const CardsManager: React.FC<Props> = ({ cards, onAddCard }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);

  const [newCard, setNewCard] = useState({
    name: '',
    bank: 'Nubank',
    limit: '',
    closingDay: '5',
    dueDay: '12',
    color: 'bg-purple-600'
  });

  const BANKS = [
    { name: 'Nubank', color: 'bg-purple-600' },
    { name: 'Itaú', color: 'bg-orange-500' },
    { name: 'Inter', color: 'bg-orange-600' },
    { name: 'Santander', color: 'bg-red-600' },
    { name: 'Bradesco', color: 'bg-rose-700' },
    { name: 'C6 Bank', color: 'bg-slate-800' }
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setSyncStep(1);
    
    setTimeout(() => setSyncStep(2), 1500);
    setTimeout(() => {
      onAddCard({
        id: Date.now().toString(),
        name: `${newCard.bank} Black`,
        limit: 15000,
        used: 2450,
        closingDay: 7,
        dueDay: 15,
        color: newCard.color,
        bank: newCard.bank
      });
      setIsSyncing(false);
      setSyncStep(0);
      setShowForm(false);
    }, 3000);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCard({
      id: Date.now().toString(),
      name: newCard.name,
      limit: parseFloat(newCard.limit),
      used: 0,
      closingDay: parseInt(newCard.closingDay),
      dueDay: parseInt(newCard.dueDay),
      color: newCard.color,
      bank: newCard.bank
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">Meus Cartões</h3>
        <button 
          onClick={() => setShowForm(true)}
          className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-8">
        {cards.map(card => {
          const perc = (card.used / card.limit) * 100;
          const isUnhealthy = perc > 80;

          return (
            <div key={card.id} className="space-y-5">
              <div className={`${card.color} p-7 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden h-52 flex flex-col justify-between`}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-sm tracking-wide block">{card.name}</span>
                      <span className="text-[10px] opacity-70 font-bold">{card.bank}</span>
                    </div>
                  </div>
                  <button className="p-1.5 hover:bg-white/10 rounded-xl transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="relative z-10">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">Total da Fatura</p>
                  <p className="text-3xl font-bold">R$ {card.used.toLocaleString()}</p>
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">Vencimento</p>
                    <p className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg inline-block">Dia {card.dueDay}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">Disponível</p>
                    <p className="text-sm font-bold">R$ {(card.limit - card.used).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] space-y-4 shadow-sm">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-400 dark:text-slate-500">Uso do Limite</span>
                  <span className={isUnhealthy ? 'text-rose-500' : 'text-emerald-500'}>
                    {perc.toFixed(1)}% utilizado
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isUnhealthy ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`} 
                    style={{ width: `${Math.min(perc, 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Card Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-bold text-slate-800 dark:text-white">Adicionar Novo Cartão</h4>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>

            {isSyncing ? (
              <div className="py-20 text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-emerald-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                    {syncStep === 1 ? <Landmark size={32} /> : <CheckCircle2 size={32} />}
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-lg dark:text-white">{syncStep === 1 ? 'Conectando ao banco...' : 'Sincronizando faturas...'}</h5>
                  <p className="text-slate-400 text-sm mt-1">Isso leva apenas alguns segundos com Open Finance.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleManualAdd} className="space-y-6">
                <div className="space-y-4">
                  <button 
                    type="button"
                    onClick={handleSync}
                    className="w-full bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-100 dark:border-emerald-500/20 p-5 rounded-3xl flex items-center justify-between text-emerald-600 dark:text-emerald-400 group active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm"><RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" /></div>
                      <div className="text-left">
                        <p className="font-bold text-sm">Open Finance</p>
                        <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">Sincronização Automática</p>
                      </div>
                    </div>
                    <CheckCircle2 size={20} className="opacity-40" />
                  </button>

                  <div className="relative flex items-center gap-4 py-2">
                    <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ou manual</span>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Apelido do Cartão</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Nubank Compras"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none text-slate-800 dark:text-white"
                      value={newCard.name}
                      onChange={e => setNewCard({...newCard, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Instituição</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none text-slate-800 dark:text-white appearance-none"
                        value={newCard.bank}
                        onChange={e => {
                          const bank = BANKS.find(b => b.name === e.target.value);
                          setNewCard({...newCard, bank: e.target.value, color: bank?.color || 'bg-slate-800'});
                        }}
                      >
                        {BANKS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Limite Total</label>
                      <input 
                        type="number" 
                        placeholder="R$ 0,00"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none text-slate-800 dark:text-white"
                        value={newCard.limit}
                        onChange={e => setNewCard({...newCard, limit: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="flex-[2] bg-slate-900 dark:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg">Salvar Cartão</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsManager;
