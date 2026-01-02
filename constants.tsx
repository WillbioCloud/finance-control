import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Heart, 
  Zap, 
  Coffee, 
  Wallet,
  Smartphone,
  TrendingUp,
  Home,
  ShieldCheck, // Importante para a Reserva
  AlertCircle
} from 'lucide-react-native';

const COLORS = {
  orange: '#f97316',
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
  red: '#ef4444',
  indigo: '#6366f1',
  yellow: '#eab308',
  emerald: '#10b981',
  cyan: '#06b6d4',
  teal: '#14b8a6',
  nubank: '#820ad1',
  gold: '#f59e0b' // Cor da Reserva
};

export const INITIAL_CATEGORIES = [
  // DESPESAS
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f01', name: 'Alimentação', iconName: 'Utensils', color: COLORS.green, type: 'EXPENSE' },
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f02', name: 'Transporte', iconName: 'Car', color: COLORS.blue, type: 'EXPENSE' },
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f03', name: 'Lazer', iconName: 'Coffee', color: COLORS.purple, type: 'EXPENSE' },
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f04', name: 'Compras', iconName: 'ShoppingBag', color: COLORS.pink, type: 'EXPENSE' },
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f05', name: 'Saúde', iconName: 'Heart', color: COLORS.red, type: 'EXPENSE' },
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f06', name: 'Moradia', iconName: 'Home', color: COLORS.indigo, type: 'EXPENSE' },
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f07', name: 'Serviços', iconName: 'Zap', color: COLORS.yellow, type: 'EXPENSE' },
  
  // CATEGORIA ESPECIAL
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f99', name: 'Reserva de Emergência', iconName: 'ShieldCheck', color: COLORS.gold, type: 'EXPENSE' },
  
  // RECEITAS
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f08', name: 'Salário', iconName: 'Wallet', color: COLORS.emerald, type: 'INCOME' },
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f09', name: 'Comissão', iconName: 'TrendingUp', color: COLORS.cyan, type: 'INCOME' },
  { id: '62c3e1b0-10f3-4d2c-8a1a-7b3c9d2e1f10', name: 'Renda Extra', iconName: 'Smartphone', color: COLORS.teal, type: 'INCOME' },
];

export const INITIAL_CARDS = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
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