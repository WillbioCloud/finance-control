
import React, { useState } from 'react';
import { TransactionType, Category } from '../types';
import { Plus, Trash2, ArrowLeft, Tag, Utensils, Car, Coffee, ShoppingBag, Heart, Home, Zap, Wallet, TrendingUp, Smartphone, Plane, AlertCircle } from 'lucide-react';

interface Props {
  categories: Category[];
  onUpdate: (cats: Category[]) => void;
  onBack: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={20} />,
  Car: <Car size={20} />,
  Coffee: <Coffee size={20} />,
  ShoppingBag: <ShoppingBag size={20} />,
  Heart: <Heart size={20} />,
  Home: <Home size={20} />,
  Zap: <Zap size={20} />,
  Wallet: <Wallet size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  Smartphone: <Smartphone size={20} />,
  Plane: <Plane size={20} />,
  AlertCircle: <AlertCircle size={20} />,
  Tag: <Tag size={20} />
};

const COLORS = [
  'bg-orange-100 text-orange-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
  'bg-red-100 text-red-600',
  'bg-indigo-100 text-indigo-600',
  'bg-emerald-100 text-emerald-600',
  'bg-teal-100 text-teal-600',
  'bg-rose-100 text-rose-600'
];

const CategoryManager: React.FC<Props> = ({ categories, onUpdate, onBack }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newIcon, setNewIcon] = useState('Tag');

  const addCategory = () => {
    if (!newName) return;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newCat: Category = {
      id: Date.now().toString(),
      name: newName,
      type: newType,
      iconName: newIcon,
      color: color
    };
    onUpdate([...categories, newCat]);
    setNewName('');
    setShowAdd(false);
  };

  const removeCategory = (id: string) => {
    onUpdate(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-bold text-xl text-slate-800 dark:text-white">Gerenciar Categorias</h3>
      </div>

      {!showAdd ? (
        <div className="space-y-6">
          <button 
            onClick={() => setShowAdd(true)}
            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center gap-2 text-slate-400 font-bold active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
          >
            <Plus size={20} />
            Nova Categoria
          </button>

          <div className="space-y-8">
            <section>
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Ganhos</h4>
              <div className="grid grid-cols-1 gap-3">
                {categories.filter(c => c.type === TransactionType.INCOME).map(cat => (
                  <CategoryItem key={cat.id} category={cat} onDelete={() => removeCategory(cat.id)} />
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Gastos</h4>
              <div className="grid grid-cols-1 gap-3">
                {categories.filter(c => c.type === TransactionType.EXPENSE).map(cat => (
                  <CategoryItem key={cat.id} category={cat} onDelete={() => removeCategory(cat.id)} />
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button 
              onClick={() => setNewType(TransactionType.EXPENSE)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${newType === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'}`}
            >
              Gasto
            </button>
            <button 
              onClick={() => setNewType(TransactionType.INCOME)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${newType === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
            >
              Ganho
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Nome da Categoria</label>
            <input 
              type="text" 
              placeholder="Ex: Assinaturas"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none focus:border-emerald-500 transition-colors text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 px-1">Selecione um Ícone</label>
            <div className="grid grid-cols-4 gap-3">
              {Object.keys(ICON_MAP).map(iconName => (
                <button
                  key={iconName}
                  onClick={() => setNewIcon(iconName)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${newIcon === iconName ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}
                >
                  {ICON_MAP[iconName]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button>
            <button onClick={addCategory} className="flex-[2] bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20">Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoryItem = ({ category, onDelete }: { category: Category, onDelete: () => void }) => (
  <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${category.color} shadow-sm`}>
        {ICON_MAP[category.iconName] || <Tag size={20} />}
      </div>
      <span className="font-bold text-slate-700 dark:text-slate-200">{category.name}</span>
    </div>
    <button onClick={onDelete} className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
      <Trash2 size={18} />
    </button>
  </div>
);

export default CategoryManager;
