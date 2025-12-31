
import React from 'react';
import { UserProfile, Transaction, CreditCard, Goal, TransactionType } from '../types';
import { 
  Settings, 
  Bell, 
  ShieldCheck, 
  ChevronRight, 
  Moon, 
  Sun, 
  LogOut, 
  HelpCircle,
  BarChart,
  Tag,
  Share2,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  transactions: Transaction[];
  cards: CreditCard[];
  goals: Goal[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onManageCategories: () => void;
}

const Profile: React.FC<Props> = ({ 
  userProfile, 
  transactions, 
  cards, 
  goals, 
  isDarkMode, 
  onToggleDarkMode,
  onManageCategories
}) => {
  const totalBalance = transactions.reduce((acc, t) => t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0);
  const totalLimit = cards.reduce((acc, c) => acc + c.limit, 0);
  const totalUsed = cards.reduce((acc, c) => acc + c.used, 0);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="bg-emerald-600 dark:bg-emerald-500 pt-12 pb-24 px-6 rounded-b-[3rem] relative">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-white font-bold text-xl">Meu Perfil</h2>
          <button className="bg-white/20 p-2 rounded-xl backdrop-blur-md text-white">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl border-4 border-white/30 overflow-hidden">
              <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-lg">
              <ShieldCheck size={14} className="text-emerald-500" />
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">{userProfile.name}</h3>
            <p className="text-emerald-100/70 text-sm">{userProfile.email}</p>
            <p className="text-emerald-100/50 text-[10px] uppercase font-bold tracking-widest mt-1">Membro desde {userProfile.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards Overlapping */}
      <div className="px-6 -mt-16 space-y-6 pb-24">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-50 dark:border-slate-700/50 grid grid-cols-2 gap-4">
          <div className="border-r border-slate-100 dark:border-slate-700 pr-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Saldo Atual</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white">R$ {totalBalance.toLocaleString()}</p>
          </div>
          <div className="pl-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Meta Alcançada</p>
            <p className="text-lg font-bold text-emerald-500">{goals.length > 0 ? ((goals[0].currentAmount / goals[0].targetAmount) * 100).toFixed(0) : 0}%</p>
          </div>
        </div>

        {/* Menu Sections */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Geral</h4>
          <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
            <MenuItem icon={<Bell size={18} />} label="Notificações" detail="2 pendentes" />
            <MenuItem icon={<Tag size={18} />} label="Minhas Categorias" onClick={onManageCategories} />
            <MenuItem icon={<Share2 size={18} />} label="Convidar Amigos" />
            <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={onToggleDarkMode}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Modo Escuro</span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2">Segurança</h4>
          <div className="bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
            <MenuItem icon={<Lock size={18} />} label="Alterar Senha" />
            <MenuItem icon={<ShieldCheck size={18} />} label="Privacidade" />
          </div>
        </section>

        <button className="w-full flex items-center justify-center gap-3 p-5 rounded-[2.5rem] bg-rose-50 dark:bg-rose-500/10 text-rose-500 font-bold text-sm">
          <LogOut size={18} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, detail, onClick }: { icon: React.ReactNode, label: string, detail?: string, onClick?: () => void }) => (
  <div onClick={onClick} className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {detail && <span className="text-[10px] font-bold text-slate-400">{detail}</span>}
      <ChevronRight size={16} className="text-slate-300" />
    </div>
  </div>
);

export default Profile;
