import "./global.css"; // <--- Importação OBRIGATÓRIA do CSS na v4
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
// Correção do erro de Deprecation: usar do safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { LayoutDashboard, ArrowUpRight, CreditCard as CardIcon, Target, PlusCircle, User as UserIcon } from 'lucide-react-native';
import { storage } from './utils/storage';
import { Transaction, TransactionType, Goal, CreditCard, UserProfile, Category } from './types';

// Importe seu componente de formulário (certifique-se que ele também não usa 'styled')
import TransactionForm from './components/TransactionForm'; 

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
      const savedCats = await storage.getItem('fc_categories');
      const savedTrans = await storage.getItem('fc_transactions');
      setCategories(savedCats || [
        { id: '1', name: 'Alimentação', iconName: 'Utensils', color: 'bg-orange-100 text-orange-600', type: 'EXPENSE' },
      ]);
      setTransactions(savedTrans || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const addTransaction = (t: any) => {
    const newTransaction = { ...t, id: Date.now().toString() };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    storage.setItem('fc_transactions', updated);
    setShowAddModal(false);
  };

  if (loading) return <View className="flex-1 justify-center items-center"><Text>Carregando...</Text></View>;

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <View className="p-6"><Text className="text-xl font-bold text-slate-800">Dashboard (Em breve)</Text></View>;
      case 'transactions': return <View className="p-6"><Text className="text-xl font-bold text-slate-800">Extrato (Em breve)</Text></View>;
      default: return <View className="p-6"><Text>Em construção</Text></View>;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      {activeTab !== 'profile' && (
        <View className="pt-2 px-6 flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-slate-400 text-sm font-medium">Olá, {initialProfile.name.split(' ')[0]}</Text>
            <Text className="text-2xl font-bold text-slate-800">Finance Control</Text>
          </View>
          <View className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
            <Image source={{ uri: initialProfile.avatar }} className="w-full h-full" />
          </View>
        </View>
      )}

      {/* Conteúdo Principal */}
      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 100 }}>
        {renderContent()}
      </ScrollView>

      {/* Botão Flutuante */}
      <TouchableOpacity 
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-24 left-[42%] w-16 h-16 bg-emerald-500 rounded-full items-center justify-center shadow-lg z-50"
      >
        <PlusCircle size={36} color="#FFF" />
      </TouchableOpacity>

      {/* Barra de Navegação */}
      <View className="absolute bottom-0 left-0 right-0 h-20 bg-white flex-row items-center justify-around border-t border-slate-100 pb-2">
        <NavButton active={activeTab === 'dashboard'} onPress={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Início" />
        <NavButton active={activeTab === 'transactions'} onPress={() => setActiveTab('transactions')} icon={ArrowUpRight} label="Extrato" />
        <NavButton active={activeTab === 'goals'} onPress={() => setActiveTab('goals')} icon={Target} label="Metas" />
        <NavButton active={activeTab === 'cards'} onPress={() => setActiveTab('cards')} icon={CardIcon} label="Cartões" />
        <NavButton active={activeTab === 'profile'} onPress={() => setActiveTab('profile')} icon={UserIcon} label="Perfil" />
      </View>

      {/* Modal */}
      {showAddModal && (
        <View className="absolute inset-0 bg-black/60 z-50 justify-end">
          <View className="bg-white rounded-t-[2.5rem] p-6 h-[85%]">
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
  <TouchableOpacity onPress={onPress} className="items-center justify-center gap-1">
    <View className={`p-1.5 rounded-xl ${active ? 'bg-emerald-50' : 'bg-transparent'}`}>
      <Icon size={24} color={active ? '#10b981' : '#94a3b8'} />
    </View>
    <Text className={`text-[10px] font-bold ${active ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</Text>
  </TouchableOpacity>
);

export default App;