import "./global.css";
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LayoutDashboard, ArrowUpRight, CreditCard as CardIcon, Target, PlusCircle, User as UserIcon } from 'lucide-react-native';
import { storage } from './utils/storage';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from './types';

// Componentes
import TransactionForm from './components/TransactionForm'; 
import Dashboard from './components/Dashboard'; // Novo
import TransactionsList from './components/TransactionsList'; // Novo

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);

  const initialProfile: UserProfile = {
    name: 'Sandra Oliveira',
    email: 'sandra@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    monthlyIncomeLimit: 5000,
    memberSince: 'Março 2024'
  };

  useEffect(() => {
    const loadData = async () => {
      // Carrega dados iniciais ou usa defaults
      const savedCats = await storage.getItem('fc_categories');
      const savedTrans = await storage.getItem('fc_transactions');
      const savedCards = await storage.getItem('fc_cards');
      
      setCategories(savedCats || [
        { id: '1', name: 'Alimentação', iconName: 'Utensils', color: 'bg-orange-100 text-orange-600', type: 'EXPENSE' },
        { id: '2', name: 'Transporte', iconName: 'Car', color: 'bg-blue-100 text-blue-600', type: 'EXPENSE' },
        { id: '3', name: 'Lazer', iconName: 'Coffee', color: 'bg-purple-100 text-purple-600', type: 'EXPENSE' },
        { id: '4', name: 'Salário', iconName: 'Wallet', color: 'bg-emerald-100 text-emerald-600', type: 'INCOME' }
      ]);
      
      setTransactions(savedTrans || []);
      
      setCards(savedCards || [
        { id: '1', name: 'Nubank Principal', limit: 5000, used: 1250, closingDay: 5, dueDay: 12, color: 'bg-purple-600', bank: 'Nubank' },
        { id: '2', name: 'Itaú Click', limit: 8000, used: 450, closingDay: 10, dueDay: 20, color: 'bg-orange-500', bank: 'Itaú' }
      ]);
      
      setLoading(false);
    };
    loadData();
  }, []);

  // Salvar sempre que transactions mudar
  useEffect(() => {
    if(!loading) storage.setItem('fc_transactions', transactions);
  }, [transactions, loading]);

  const addTransaction = (t: any) => {
    const newTransaction = { ...t, id: Date.now().toString() };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    
    // Atualiza cartão se for crédito
    if (t.paymentMethod === 'CREDIT' && cards.length > 0) {
        // Lógica simples: adiciona ao primeiro cartão para demonstração
        const updatedCards = [...cards];
        updatedCards[0].used += t.amount;
        setCards(updatedCards);
    }
    
    setShowAddModal(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return <View className="flex-1 justify-center items-center"><Text>Carregando...</Text></View>;

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': 
        return <Dashboard 
                  transactions={transactions} 
                  goals={goals} 
                  cards={cards} 
                  userProfile={initialProfile} 
                  categories={categories}
                  onDeleteTransaction={deleteTransaction}
                  onNavigate={setActiveTab}
               />;
      case 'transactions': 
        return <TransactionsList 
                  transactions={transactions} 
                  onDelete={deleteTransaction} 
                  categories={categories} 
               />;
      case 'goals': return <View className="p-6"><Text className="text-xl font-bold text-slate-800">Metas (Em breve)</Text></View>;
      case 'cards': return <View className="p-6"><Text className="text-xl font-bold text-slate-800">Cartões (Em breve)</Text></View>;
      case 'profile': return <View className="p-6"><Text className="text-xl font-bold text-slate-800">Perfil (Em breve)</Text></View>;
      default: return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header Fixo */}
      {activeTab !== 'profile' && (
        <View className="pt-2 px-6 flex-row justify-between items-center mb-2 z-20">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">Finanças</Text>
            <Text className="text-2xl font-bold text-slate-800">Olá, {initialProfile.name.split(' ')[0]}</Text>
          </View>
          <View className="w-10 h-10 rounded-2xl bg-slate-200 overflow-hidden border border-white shadow-sm">
            <Image source={{ uri: initialProfile.avatar }} className="w-full h-full" />
          </View>
        </View>
      )}

      {/* Conteúdo Principal com Scroll */}
      <ScrollView 
        className="flex-1 bg-slate-50 px-6" 
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

      {/* Botão Flutuante (FAB) */}
      <TouchableOpacity 
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-24 right-6 w-16 h-16 bg-emerald-500 rounded-full items-center justify-center shadow-lg shadow-emerald-500/40 z-50"
      >
        <PlusCircle size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Barra de Navegação */}
      <View className="absolute bottom-0 left-0 right-0 h-[85px] bg-white flex-row items-center justify-around border-t border-slate-100 pb-4 shadow-2xl shadow-black">
        <NavButton active={activeTab === 'dashboard'} onPress={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Início" />
        <NavButton active={activeTab === 'transactions'} onPress={() => setActiveTab('transactions')} icon={ArrowUpRight} label="Extrato" />
        <NavButton active={activeTab === 'goals'} onPress={() => setActiveTab('goals')} icon={Target} label="Metas" />
        <NavButton active={activeTab === 'cards'} onPress={() => setActiveTab('cards')} icon={CardIcon} label="Cartões" />
        <NavButton active={activeTab === 'profile'} onPress={() => setActiveTab('profile')} icon={UserIcon} label="Perfil" />
      </View>

      {/* Modal Adicionar */}
      {showAddModal && (
        <View className="absolute inset-0 bg-black/60 z-[60] justify-end">
          <View className="bg-white rounded-t-[2.5rem] p-6 h-[90%]">
             <TouchableOpacity onPress={() => setShowAddModal(false)} className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
             <ScrollView showsVerticalScrollIndicator={false}>
               <TransactionForm categories={categories} onAdd={addTransaction} onCancel={() => setShowAddModal(false)} />
             </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const NavButton = ({ active, onPress, icon: Icon, label }: any) => (
  <TouchableOpacity onPress={onPress} className="items-center justify-center gap-1 w-16">
    <View className={`p-1.5 rounded-2xl transition-all ${active ? 'bg-emerald-50' : 'bg-transparent'}`}>
      <Icon size={24} color={active ? '#10b981' : '#94a3b8'} strokeWidth={active ? 2.5 : 2} />
    </View>
    <Text className={`text-[9px] font-bold ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</Text>
  </TouchableOpacity>
);

export default App;