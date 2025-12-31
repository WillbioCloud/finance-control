
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  CreditCard as CardIcon, 
  Target,
  PlusCircle,
  BarChart3,
  User as UserIcon
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod, Goal, CreditCard, UserProfile, Category } from './types';
import Dashboard from './components/Dashboard';
import TransactionsList from './components/TransactionsList';
import CardsManager from './components/CardsManager';
import GoalsManager from './components/GoalsManager';
import Analysis from './components/Analysis';
import TransactionForm from './components/TransactionForm';
import CategoryManager from './components/CategoryManager';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'cards' | 'goals' | 'analysis' | 'categories' | 'profile'>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('fc_theme') === 'dark');
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fc_theme', 'light');
    }
  }, [isDarkMode]);

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('fc_categories');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Alimentação', iconName: 'Utensils', color: 'bg-orange-100 text-orange-600', type: TransactionType.EXPENSE },
      { id: '2', name: 'Transporte', iconName: 'Car', color: 'bg-blue-100 text-blue-600', type: TransactionType.EXPENSE },
      { id: '3', name: 'Lazer', iconName: 'Coffee', color: 'bg-purple-100 text-purple-600', type: TransactionType.EXPENSE },
      { id: '4', name: 'Salário', iconName: 'Wallet', color: 'bg-emerald-100 text-emerald-600', type: TransactionType.INCOME }
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fc_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('fc_goals');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Reserva de Emergência', targetAmount: 10000, currentAmount: 2500, icon: 'Emergency' }
    ];
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('fc_cards');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Nubank Principal', limit: 5000, used: 1250, closingDay: 5, dueDay: 12, color: 'bg-purple-600', bank: 'Nubank' }
    ];
  });

  const [userProfile] = useState<UserProfile>({
    name: 'Sandra Oliveira',
    email: 'sandra.oliveira@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    monthlyIncomeLimit: 5000,
    memberSince: 'Março 2024'
  });

  useEffect(() => localStorage.setItem('fc_categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('fc_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('fc_goals', JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem('fc_cards', JSON.stringify(cards)), [cards]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Date.now().toString() };
    setTransactions(prev => [newTransaction, ...prev]);
    if (t.paymentMethod === PaymentMethod.CREDIT && cards.length > 0) {
      setCards(prev => prev.map(c => ({ ...c, used: c.used + t.amount })));
    }
    setShowAddModal(false);
  };

  const addCard = (newCard: CreditCard) => {
    setCards(prev => [...prev, newCard]);
  };

  const updateGoal = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
  };

  const addNewGoal = (newGoal: Goal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard transactions={transactions} goals={goals} cards={cards} userProfile={userProfile} categories={categories} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} />;
      case 'transactions': return <TransactionsList transactions={transactions} onDelete={(id) => setTransactions(t => t.filter(x => x.id !== id))} categories={categories} />;
      case 'cards': return <CardsManager cards={cards} onAddCard={addCard} />;
      case 'goals': return <GoalsManager goals={goals} onUpdateGoal={updateGoal} onAddGoal={addNewGoal} />;
      case 'analysis': return <Analysis transactions={transactions} />;
      case 'categories': return <CategoryManager categories={categories} onUpdate={setCategories} onBack={() => setActiveTab('profile')} />;
      case 'profile': return <Profile userProfile={userProfile} transactions={transactions} cards={cards} goals={goals} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onManageCategories={() => setActiveTab('categories')} />;
      default: return <Dashboard transactions={transactions} goals={goals} cards={cards} userProfile={userProfile} categories={categories} onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))} />;
    }
  };

  return (
    <div className="min-h-screen pb-32 max-w-md mx-auto relative shadow-2xl bg-white dark:bg-slate-900 border-x border-slate-100 dark:border-slate-800 flex flex-col overflow-y-auto no-scrollbar">
      {activeTab !== 'profile' && (
        <header className="pt-8 px-6 flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-slate-400 dark:text-slate-500 text-sm font-medium">Olá, {userProfile.name.split(' ')[0]}</h2>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Finance Control</h1>
          </div>
          <button onClick={() => setActiveTab('profile')} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
            <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
          </button>
        </header>
      )}

      <main className={`flex-grow ${activeTab === 'profile' ? '' : 'px-6'} transition-all duration-300`}>
        {renderContent()}
      </main>

      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center z-50 transform active:scale-95 transition-transform md:translate-x-32"
      >
        <PlusCircle size={36} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-2 z-40">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22} />} label="Início" />
        <NavButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={<ArrowUpRight size={22} />} label="Extrato" />
        <NavButton active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon={<Target size={22} />} label="Metas" />
        <NavButton active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} icon={<CardIcon size={22} />} label="Cartões" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={22} />} label="Perfil" />
      </nav>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-6 animate-in slide-in-from-bottom duration-300 max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" onClick={() => setShowAddModal(false)} />
            <TransactionForm categories={categories} onAdd={addTransaction} onCancel={() => setShowAddModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
    <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-transparent'}`}>{icon}</div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
