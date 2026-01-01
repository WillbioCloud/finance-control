import { Utensils, Car, ShoppingBag, Heart, Zap, Coffee, Wallet,Smartphone,TrendingUp,Home,Plane,AlertCircle } from 'lucide-react-native'; // CORREÇÃO: Import correto para Mobile

// Mapeamento de Cores para Hex (Substituindo Tailwind)
const COLORS = {
  orange: '#f97316',
  blue: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  red: '#ef4444',
  indigo: '#6366f1',
  yellow: '#eab308',
  emerald: '#10b981',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  nubank: '#820ad1'
};

export const INITIAL_CATEGORIES = [
  // DESPESAS
  { id: '1', name: 'Alimentação', iconName: 'Utensils', color: COLORS.orange, type: 'EXPENSE' },
  { id: '2', name: 'Transporte', iconName: 'Car', color: COLORS.blue, type: 'EXPENSE' },
  { id: '3', name: 'Lazer', iconName: 'Coffee', color: COLORS.purple, type: 'EXPENSE' },
  { id: '4', name: 'Compras', iconName: 'ShoppingBag', color: COLORS.pink, type: 'EXPENSE' },
  { id: '5', name: 'Saúde', iconName: 'Heart', color: COLORS.red, type: 'EXPENSE' },
  { id: '6', name: 'Moradia', iconName: 'Home', color: COLORS.indigo, type: 'EXPENSE' },
  { id: '7', name: 'Serviços', iconName: 'Zap', color: COLORS.yellow, type: 'EXPENSE' },
  // RECEITAS
  { id: '8', name: 'Salário', iconName: 'Wallet', color: COLORS.emerald, type: 'INCOME' },
  { id: '9', name: 'Comissão', iconName: 'TrendingUp', color: COLORS.cyan, type: 'INCOME' },
  { id: '10', name: 'Renda Extra', iconName: 'Smartphone', color: COLORS.teal, type: 'INCOME' },
];

export const INITIAL_CARDS = [
  {
    id: '1',
    name: 'Nubank',
    bank: 'Nubank',
    limit: 5000,
    used: 1250,
    closingDay: 5,
    dueDay: 12,
    color: COLORS.nubank
  }
];

export const INITIAL_PROFILE = {
  name: 'Usuário',
  email: 'usuario@email.com',
  avatar: 'https://github.com/shadcn.png',
  monthlyIncomeLimit: 10000,
  memberSince: '2024'
};