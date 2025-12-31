
import React, { useState } from 'react';
import { Goal } from '../types';
import { Target, TrendingUp, Plus, Calendar, ChevronRight, X, Sparkles, CheckCircle2, Landmark } from 'lucide-react';

interface Props {
  goals: Goal[];
  onUpdateGoal: (id: string, amount: number) => void;
  onAddGoal: (goal: Goal) => void;
}

const GoalsManager: React.FC<Props> = ({ goals, onUpdateGoal, onAddGoal }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;

    onAddGoal({
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline || undefined,
      icon: 'Target',
    });
    setNewGoal({ name: '', targetAmount: '', deadline: '' });
    setShowAddModal(false);
  };

  const handleContribution = () => {
    if (!contributionAmount || !showContributionModal) return;
    onUpdateGoal(showContributionModal, parseFloat(contributionAmount));
    setContributionAmount('');
    setShowContributionModal(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xl text-slate-800 dark:text-white">Suas Metas</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Planeje seu futuro financeiro</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {goals.length > 0 ? goals.map(goal => {
          const perc = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          
          return (
            <div key={goal.id} className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm group hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-[1.25rem] flex items-center justify-center shadow-sm">
                    <Target size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{goal.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Objetivo: R$ {goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">
                    {perc.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1 px-1">Progresso Atual</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">R$ {goal.currentAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-right pb-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Restam</p>
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">R$ {remaining > 0 ? remaining.toLocaleString() : 'Concluído!'}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    style={{ width: `${Math.min(perc, 100)}%` }}
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowContributionModal(goal.id)}
                    className="flex-1 bg-emerald-500 text-white text-[10px] font-bold py-3 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Plus size={14} /> Adicionar Valor
                  </button>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-300">Em ritmo acelerado</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Você ainda não criou metas.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-emerald-500 text-xs font-bold uppercase tracking-widest"
            >
              Criar primeira meta
            </button>
          </div>
        )}
      </div>

      <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={18} className="text-indigo-200" />
          <h4 className="font-bold text-sm tracking-wide">Dica Financeira</h4>
        </div>
        <p className="text-[11px] text-indigo-100/90 leading-relaxed font-medium">
          Sabia que metas com aportes mensais recorrentes têm <span className="text-white font-bold">80% mais chance</span> de serem concluídas no prazo?
        </p>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-bold text-slate-800 dark:text-white">Novo Objetivo</h4>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">O que você quer conquistar?</label>
                <input 
                  type="text" 
                  placeholder="Ex: Viagem para o Japão"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none text-slate-800 dark:text-white"
                  value={newGoal.name}
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Valor Alvo</label>
                  <input 
                    type="number" 
                    placeholder="R$ 0,00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none text-slate-800 dark:text-white"
                    value={newGoal.targetAmount}
                    onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Prazo (opcional)</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl outline-none text-slate-800 dark:text-white"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button>
                <button type="submit" className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg">Salvar Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {showContributionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-6">
          <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 animate-in zoom-in duration-300">
            <h4 className="text-lg font-bold text-center mb-2 dark:text-white">Adicionar Valor</h4>
            <p className="text-center text-xs text-slate-400 mb-6">Quanto você quer poupar hoje?</p>
            
            <div className="relative mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-300">R$</span>
              <input 
                type="number" 
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-800 border-none p-5 pl-12 rounded-3xl outline-none text-2xl font-bold text-center text-slate-800 dark:text-white"
                placeholder="0,00"
                value={contributionAmount}
                onChange={e => setContributionAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowContributionModal(null)} className="flex-1 py-4 font-bold text-slate-400 text-sm">Cancelar</button>
              <button onClick={handleContribution} className="flex-[2] bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
                Confirmar Aporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsManager;
