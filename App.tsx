import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, StatusBar, TouchableOpacity, Text, Platform, ActivityIndicator, Alert } from 'react-native';
import { Home, PieChart, CreditCard as CardIcon, Target, User, PlusCircle, List, LogIn } from 'lucide-react-native';

import { supabase } from './utils/supabase';
import { FinanceService } from './services/financeService';
import { generateUUID } from './utils/helpers';

import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionsList from './components/TransactionsList';
import Analysis from './components/Analysis';
import CardsManager from './components/CardsManager';
import GoalsManager from './components/GoalsManager';
import Profile from './components/Profile';
import CategoryManager from './components/CategoryManager';
import LoginScreen from './components/LoginScreen';

import { Transaction, Category, Goal, CreditCard as CardType, UserProfile } from './types';
import { INITIAL_CATEGORIES, INITIAL_CARDS, INITIAL_PROFILE } from './constants';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<CardType[]>(INITIAL_CARDS);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setTransactions([]);
        setGoals([]);
      }
    });
  }, []);

  useEffect(() => {
    if (session) {
      loadCloudData();
    }
  }, [session]);

  const loadCloudData = async () => {
    setLoadingData(true);
    try {
      let profile = await FinanceService.fetchProfile();
      if (!profile && session?.user) {
        const newProfile: UserProfile = {
          name: session.user.user_metadata?.name || 'Usuário',
          email: session.user.email || '',
          avatar: 'https://github.com/shadcn.png',
          monthlyIncomeLimit: 0,
          memberSince: new Date().getFullYear().toString()
        };
        await FinanceService.updateProfile(newProfile);
        profile = newProfile;
      }
      if (profile) setUserProfile(profile);

      const [txs, cats, metas, cartoes] = await Promise.all([
        FinanceService.fetchTransactions(),
        FinanceService.fetchCategories(),
        FinanceService.fetchGoals(),
        FinanceService.fetchCards(),
      ]);

      if (txs) setTransactions(txs);
      
      // --- LÓGICA DE SINCRONIZAÇÃO DE CATEGORIAS ---
      if (cats && cats.length > 0) {
        const mappedCats = cats.map((c: any) => ({ ...c, iconName: c.icon_name || c.iconName }));
        
        // Verifica se a categoria especial "Reserva de Emergência" está faltando no banco
        const emergencyCat = INITIAL_CATEGORIES.find(ic => ic.name === 'Reserva de Emergência');
        const hasEmergency = mappedCats.some(mc => mc.name === emergencyCat?.name);

        if (!hasEmergency && emergencyCat) {
          // Se faltar, adiciona na lista local E salva no banco
          mappedCats.push(emergencyCat);
          await FinanceService.syncCategories([emergencyCat]);
        }

        setCategories(mappedCats);
      } else {
        await FinanceService.syncCategories(INITIAL_CATEGORIES);
        setCategories(INITIAL_CATEGORIES);
      }
      // ---------------------------------------------

      if (metas) {
        const mappedGoals = metas.map((g: any) => ({
          ...g,
          targetAmount: g.target_amount || g.targetAmount,
          currentAmount: g.current_amount || g.currentAmount,
          monthlyAllocation: g.monthly_allocation || g.monthlyAllocation
        }));
        setGoals(mappedGoals);
      }
      if (cartoes) {
        const mappedCards = cartoes.map((c: any) => ({
          ...c,
          closingDay: c.closing_day || c.closingDay,
          dueDay: c.due_day || c.dueDay
        }));
        setCards(mappedCards);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddTransaction = async (newTransaction: any) => {
    const tempId = generateUUID();
    const transactionWithId = { ...newTransaction, id: tempId };
    setTransactions([transactionWithId, ...transactions]);
    setShowAddModal(false);
    setActiveTab('home');
    try {
      const { id, ...dataToSave } = transactionWithId;
      const savedTx = await FinanceService.addTransaction(dataToSave);
      setTransactions(prev => prev.map(t => t.id === tempId ? savedTx : t));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar na nuvem.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    try { await FinanceService.deleteTransaction(id); } catch (error) { console.error(error); }
  };

  const handleUpdateGoals = async (newGoals: Goal[]) => {
    setGoals(newGoals);
    try { await FinanceService.updateGoals(newGoals); } catch(e) { console.log(e); }
  };

  const handleUpdateCards = async (newCards: CardType[]) => {
    setCards(newCards);
    try { await FinanceService.updateCards(newCards); } catch(e) { console.log(e); }
  };

  const handleUpdateCategories = async (newCats: Category[]) => {
    setCategories(newCats);
    try { await FinanceService.syncCategories(newCats); } catch(e) { console.log(e); }
  };

  if (loadingSession) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#10b981" /></View>;
  if (!session) return <LoginScreen onLoginSuccess={() => {}} />;

  const renderContent = () => {
    if (showAddModal) return <TransactionForm categories={categories} onAdd={handleAddTransaction} onCancel={() => setShowAddModal(false)} />;
    switch (activeTab) {
      case 'home': return <Dashboard transactions={transactions} goals={goals} cards={cards} userProfile={userProfile} categories={categories} onDeleteTransaction={handleDeleteTransaction} onNavigate={setActiveTab} />;
      case 'list': return <TransactionsList transactions={transactions} categories={categories} onDelete={handleDeleteTransaction} />;
      case 'analysis': return <Analysis transactions={transactions} categories={categories} />;
      case 'cards': return <CardsManager cards={cards} onUpdate={handleUpdateCards} onAddCard={() => {}} />;
      case 'goals': return <GoalsManager goals={goals} onUpdate={handleUpdateGoals} transactions={transactions} categories={categories} onAddTransaction={handleAddTransaction} />;
      case 'profile': return <Profile profile={userProfile} onUpdateProfile={setUserProfile} onNavigate={(screen) => setActiveTab(screen)} />;
      case 'categories': return <CategoryManager categories={categories} onUpdate={handleUpdateCategories} onBack={() => setActiveTab('profile')} />;
      default: return null;
    }
  };

  const renderBottomMenu = () => {
    if (showAddModal || activeTab === 'categories') return null;
    const tabs = [
      { id: 'home', icon: Home, label: 'Início' },
      { id: 'list', icon: List, label: 'Extrato' },
      { id: 'add', icon: PlusCircle, label: 'Add', special: true },
      { id: 'analysis', icon: PieChart, label: 'Análise' },
      { id: 'profile', icon: User, label: 'Perfil' },
    ];
    return (
      <View style={styles.bottomBar}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          if (tab.special) {
            return (
              <TouchableOpacity key={tab.id} onPress={() => setShowAddModal(true)} style={styles.addButtonContainer}>
                <View style={styles.addButton}><PlusCircle color="#fff" size={28} /></View>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} style={styles.tabItem}>
              <tab.icon size={24} color={isActive ? '#10b981' : '#94a3b8'} strokeWidth={isActive ? 2.5 : 2} />
              <Text style={[styles.tabLabel, { color: isActive ? '#10b981' : '#94a3b8' }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.content}>
        {loadingData ? <View style={styles.centerContainer}><ActivityIndicator size="large" color="#10b981" /></View> : renderContent()}
      </View>
      {renderBottomMenu()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: Platform.OS === 'android' ? 25 : 0 },
  content: { flex: 1, paddingHorizontal: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomBar: { flexDirection: 'row', backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', justifyContent: 'space-around', alignItems: 'flex-end', height: 80, paddingBottom: Platform.OS === 'ios' ? 20 : 12 },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabLabel: { fontSize: 10, marginTop: 4, fontWeight: '600' },
  addButtonContainer: { top: -20, justifyContent: 'center', alignItems: 'center', flex: 1 },
  addButton: { backgroundColor: '#10b981', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }
});