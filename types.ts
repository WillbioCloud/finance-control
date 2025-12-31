
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export interface TransactionDetail {
  item: string;
  amount: number;
  quantity?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  paymentMethod: PaymentMethod;
  isRecurrent: boolean;
  details?: TransactionDetail[];
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  used: number;
  closingDay: number;
  dueDay: number;
  color: string;
  bank?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  monthlyIncomeLimit: number;
  memberSince: string;
}
