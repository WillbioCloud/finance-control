import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, StatusBar, TouchableOpacity, Text, Platform } from 'react-native';
import { Home, PieChart, CreditCard, Target, User, PlusCircle, List } from 'lucide-react-native';

// Componentes
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionsList from './components/TransactionsList';
import Analysis from './components/Analysis';
import CardsManager from './components/CardsManager';
import GoalsManager from './components/GoalsManager';
import Profile from './components/Profile';
import CategoryManager from './components/CategoryManager';

// Utils & Types
import { loadData, saveData } from './utils/storage';
import { Transaction, Category, Goal, CreditCard as CardType, UserProfile } from './types';
import { INITIAL_CATEGORIES, INITIAL_CARDS, INITIAL_PROFILE } from './constants';

export default function App() {
  // Estados Globais
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dados
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<CardType[]>(INITIAL_CARDS);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Carregar Dados
  useEffect(() => {
    const init = async () => {
      const data = await loadData();
      if (data) {
        setTransactions(data.transactions || []);
        setCategories(data.categories.length > 0 ? data.categories : INITIAL_CATEGORIES);
        setGoals(data.goals || []);
        setCards(data.cards.length > 0 ? data.cards : INITIAL_CARDS);
        setUserProfile(data.userProfile || INITIAL_PROFILE);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Salvar Dados
  useEffect(() => {
    if (!loading) {
      saveData({ transactions, categories, goals, cards, userProfile });
    }
  }, [transactions, categories, goals, cards, userProfile, loading]);

  const handleAddTransaction = (newTransaction: any) => {
    const transactionWithId = { ...newTransaction, id: Date.now().toString() };
    setTransactions([transactionWithId, ...transactions]);
    setShowAddModal(false);
    setActiveTab('home');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Renderização da Tela Principal
  const renderContent = () => {
    if (showAddModal) {
      return (
        <TransactionForm 
          categories={categories} 
          onAdd={handleAddTransaction} 
          onCancel={() => setShowAddModal(false)} 
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            transactions={transactions} 
            goals={goals} 
            cards={cards} 
            userProfile={userProfile}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
            onNavigate={setActiveTab}
          />
        );
      case 'list':
        return <TransactionsList transactions={transactions} categories={categories} onDelete={handleDeleteTransaction} />;
      case 'analysis':
        return <Analysis transactions={transactions} categories={categories} />;
      case 'cards':
        return <CardsManager cards={cards} onUpdate={setCards} />;
      case 'goals':
        return <GoalsManager goals={goals} onUpdate={setGoals} />;
      case 'profile':
        return (
          <Profile 
            profile={userProfile} 
            onUpdateProfile={setUserProfile} 
            onNavigate={(screen) => {
               if (screen === 'categories') setActiveTab('categories');
            }}
          />
        );
      case 'categories':
        return (
          <CategoryManager 
            categories={categories} 
            onUpdateCategories={setCategories} 
            onBack={() => setActiveTab('profile')} 
          />
        );
      default:
        return null;
    }
  };

  // Menu Inferior
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
              <TouchableOpacity 
                key={tab.id} 
                onPress={() => setShowAddModal(true)}
                style={styles.addButtonContainer}
              >
                <View style={styles.addButton}>
                  <PlusCircle color="#fff" size={28} />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => setActiveTab(tab.id)}
              style={styles.tabItem}
            >
              <tab.icon 
                size={24} 
                color={isActive ? '#10b981' : '#94a3b8'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text style={[styles.tabLabel, { color: isActive ? '#10b981' : '#94a3b8' }]}>
                {tab.label}
              </Text>
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
        {renderContent()}
      </View>
      {renderBottomMenu()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9', // slate-100
    justifyContent: 'space-around',
    alignItems: 'flex-end', // Alinha itens na base para o botão Add flutuar
    height: 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  addButtonContainer: {
    top: -20, // Faz o botão flutuar
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#10b981', // emerald-500
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
});