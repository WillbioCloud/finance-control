import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Transaction, TransactionType, Category } from '../types';
import { Trash2, Tag, ChevronDown, ChevronUp, Sparkles, ShoppingBag } from 'lucide-react-native';

// Componente Individual de Transação
export const TransactionItem = ({ t, onDelete, cat }: { t: Transaction, onDelete: (id: string) => void, cat: Category | undefined }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Verifica se tem detalhes salvos
  const hasDetails = t.details && Array.isArray(t.details) && t.details.length > 0;

  const handleDelete = () => {
    Alert.alert(
      "Excluir",
      "Tem certeza que deseja excluir esta transação?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => onDelete(t.id) }
      ]
    );
  };

  return (
    <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden mb-2 shadow-sm">
      <TouchableOpacity 
        className="p-4 flex-row items-center justify-between"
        onPress={() => hasDetails && setIsExpanded(!isExpanded)}
        activeOpacity={hasDetails ? 0.7 : 1}
      >
        <View className="flex-row items-center gap-4 flex-1">
          {/* Ícone da Categoria */}
          <View className={`w-12 h-12 rounded-2xl items-center justify-center ${cat?.color || 'bg-slate-100'}`}>
             <Text className="font-bold text-lg">{cat?.name.charAt(0) || '?'}</Text>
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>{t.description}</Text>
              {/* Ícone Mágico se tiver IA */}
              {hasDetails && (
                <View className="bg-purple-100 px-1.5 py-0.5 rounded-md flex-row items-center gap-0.5">
                  <Sparkles size={10} color="#9333ea" />
                  <Text className="text-[8px] font-bold text-purple-700">IA</Text>
                </View>
              )}
            </View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.category}</Text>
          </View>
        </View>

        <View className="items-end gap-1 ml-2">
           <Text className={`font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-800'}`}>
              {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </Text>
           <View className="flex-row items-center gap-3">
             {hasDetails && (
                isExpanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />
             )}
             <TouchableOpacity onPress={handleDelete} className="p-1">
               <Trash2 size={16} color="#cbd5e1" />
             </TouchableOpacity>
           </View>
        </View>
      </TouchableOpacity>

      {/* Detalhes Expansíveis da IA */}
      {isExpanded && hasDetails && (
        <View className="px-4 pb-4 pt-0">
          <View className="h-[1px] bg-slate-100 mb-3 mx-2" />
          <View className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <View className="flex-row items-center gap-2 mb-3">
               <ShoppingBag size={12} color="#64748b" />
               <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Itens Identificados pela IA</Text>
            </View>
            
            <View className="gap-2">
              {t.details?.map((item, idx) => (
                <View key={idx} className="flex-row justify-between items-start border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0">
                   <Text className="text-xs text-slate-600 font-medium flex-1 mr-2">
                     {item.quantity && <Text className="font-bold text-slate-400">{item.quantity}x </Text>}
                     {item.item}
                   </Text>
                   <Text className="text-xs font-bold text-slate-700">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </View>
              ))}
            </View>
            
            {/* Total dos Itens vs Total da Transação */}
            <View className="mt-3 pt-2 border-t border-slate-200 flex-row justify-between items-center">
                <Text className="text-[10px] text-slate-400">Total dos itens</Text>
                <Text className="text-[10px] font-bold text-slate-500">
                   R$ {t.details?.reduce((acc, i) => acc + i.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const TransactionsList: React.FC<any> = ({ transactions, onDelete, categories }) => {
  // Agrupar por data
  const grouped = transactions.reduce((acc: any, t: Transaction) => {
    const date = t.date; 
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <View className="space-y-6 pb-20">
      <Text className="font-bold text-xl text-slate-800 mb-2">Seu Extrato</Text>
      
      {sortedDates.length > 0 ? sortedDates.map(date => (
        <View key={date} className="mb-4">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'short' })}
          </Text>
          <View className="gap-2">
            {grouped[date].map((t: Transaction) => (
              <TransactionItem 
                key={t.id} 
                t={t} 
                onDelete={onDelete} 
                cat={categories.find((c: any) => c.name === t.category)} 
              />
            ))}
          </View>
        </View>
      )) : (
        <View className="items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <Tag size={48} color="#cbd5e1" />
          <Text className="text-slate-400 text-sm italic mt-4">Nenhuma transação encontrada.</Text>
        </View>
      )}
    </View>
  );
};

export default TransactionsList;