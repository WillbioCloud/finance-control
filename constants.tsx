
import React from 'react';
import { 
  Home, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Heart, 
  Zap, 
  Coffee, 
  Wallet,
  Smartphone,
  Plane,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const CATEGORIES = {
  EXPENSE: [
    { name: 'Alimentação', icon: <Utensils size={20} />, color: 'bg-orange-100 text-orange-600' },
    { name: 'Transporte', icon: <Car size={20} />, color: 'bg-blue-100 text-blue-600' },
    { name: 'Lazer', icon: <Coffee size={20} />, color: 'bg-purple-100 text-purple-600' },
    { name: 'Compras', icon: <ShoppingBag size={20} />, color: 'bg-pink-100 text-pink-600' },
    { name: 'Saúde', icon: <Heart size={20} />, color: 'bg-red-100 text-red-600' },
    { name: 'Moradia', icon: <Home size={20} />, color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Serviços', icon: <Zap size={20} />, color: 'bg-yellow-100 text-yellow-600' },
  ],
  INCOME: [
    { name: 'Salário', icon: <Wallet size={20} />, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Comissão', icon: <TrendingUp size={20} />, color: 'bg-cyan-100 text-cyan-600' },
    { name: 'Renda Extra', icon: <Smartphone size={20} />, color: 'bg-teal-100 text-teal-600' },
  ]
};

export const GOAL_ICONS = [
  { name: 'Travel', icon: <Plane size={24} /> },
  { name: 'House', icon: <Home size={24} /> },
  { name: 'Emergency', icon: <AlertCircle size={24} /> },
  { name: 'Invest', icon: <TrendingUp size={24} /> },
];
