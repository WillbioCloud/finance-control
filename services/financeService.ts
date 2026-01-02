import { supabase } from '../utils/supabase';
import { Transaction, Category, Goal, CreditCard, UserProfile } from '../types';

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  return user.id;
};

export const FinanceService = {
  
  // --- PERFIL ---
  async fetchProfile() {
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { 
       throw error;
    }
    
    if (data) {
      return {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        monthlyIncomeLimit: data.monthly_income_limit,
        memberSince: data.member_since
      } as UserProfile;
    }
    return null;
  },

  async updateProfile(profile: UserProfile) {
    const userId = await getUserId();
    
    const profileData = {
      id: userId,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      monthly_income_limit: profile.monthlyIncomeLimit,
      member_since: profile.memberSince
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData);

    if (error) throw error;
  },

  // --- TRANSAÇÕES ---
  async fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map((t: any) => ({
      id: t.id,
      amount: t.amount,
      description: t.description,
      category: t.category,
      type: t.type,
      date: t.date,
      paymentMethod: t.payment_method,
      isRecurrent: t.is_recurrent,
      recurrenceType: t.recurrence_type,
      details: t.details
    })) as Transaction[];
  },

  async addTransaction(transaction: Omit<Transaction, 'id'>) {
    const userId = await getUserId();
    
    const txToSave = {
      user_id: userId,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      payment_method: transaction.paymentMethod,
      is_recurrent: transaction.isRecurrent,
      recurrence_type: transaction.recurrenceType,
      details: transaction.details
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([txToSave])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...transaction,
      id: data.id
    } as Transaction;
  },

  // NOVO: Função para ATUALIZAR uma transação existente
  async updateTransaction(transaction: Transaction) {
    const txToUpdate = {
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      payment_method: transaction.paymentMethod,
      is_recurrent: transaction.isRecurrent,
      recurrence_type: transaction.recurrenceType,
      details: transaction.details
    };

    const { error } = await supabase
      .from('transactions')
      .update(txToUpdate)
      .eq('id', transaction.id);

    if (error) throw error;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  // --- CATEGORIAS ---
  async fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      iconName: c.icon_name,
      color: c.color,
      type: c.type
    })) as Category[];
  },

  async syncCategories(categories: Category[]) {
    const userId = await getUserId();
    
    const catsWithUser = categories.map(c => ({ 
      id: c.id,
      user_id: userId,
      name: c.name,
      icon_name: c.iconName,
      color: c.color,
      type: c.type
    }));
    
    const { data, error } = await supabase
      .from('categories')
      .upsert(catsWithUser, { onConflict: 'id' })
      .select();
      
    if (error) throw error;
    return data;
  },

  // --- METAS ---
  async fetchGoals() {
    const { data, error } = await supabase.from('goals').select('*');
    if (error) throw error;
    
    return data.map((g: any) => ({
      id: g.id,
      name: g.name,
      targetAmount: g.target_amount,
      currentAmount: g.current_amount,
      deadline: g.deadline,
      monthlyAllocation: g.monthly_allocation,
      icon: g.icon
    })) as Goal[];
  },

  async updateGoals(goals: Goal[]) {
    const userId = await getUserId();
    
    const goalsWithUser = goals.map(g => ({ 
      id: g.id,
      user_id: userId,
      name: g.name,
      target_amount: g.targetAmount,
      current_amount: g.currentAmount,
      deadline: g.deadline,
      monthly_allocation: g.monthlyAllocation,
      icon: g.icon
    }));

    const { data, error } = await supabase
      .from('goals')
      .upsert(goalsWithUser, { onConflict: 'id' })
      .select();

    if (error) throw error;
    return data; 
  },

  // --- CARTÕES ---
  async fetchCards() {
    const { data, error } = await supabase.from('cards').select('*');
    if (error) throw error;
    
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      bank: c.bank,
      limit: c.limit,
      used: c.used,
      closingDay: c.closing_day,
      dueDay: c.due_day,
      color: c.color
    })) as CreditCard[];
  },

  async updateCards(cards: CreditCard[]) {
    const userId = await getUserId();
    
    const cardsWithUser = cards.map(c => ({
      id: c.id,
      user_id: userId,
      name: c.name,
      bank: c.bank,
      limit: c.limit,
      used: c.used,
      closing_day: c.closingDay,
      due_day: c.dueDay,
      color: c.color
    }));

    const { error } = await supabase.from('cards').upsert(cardsWithUser);
    if (error) throw error;
  }
};