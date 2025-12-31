import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { TransactionType, PaymentMethod, Category } from '../types';
import { ChevronDown, Loader2 } from 'lucide-react-native'; // Use lucide-react-native

interface Props {
  categories: Category[];
  onAdd: (t: any) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<Props> = ({ categories, onAdd, onCancel }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  
  const currentCategories = categories.filter(c => c.type === type);
  const [category, setCategory] = useState(currentCategories[0]?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!amount || !description) {
      Alert.alert("Erro", "Preencha valor e descrição");
      return;
    }

    onAdd({
      amount: parseFloat(amount),
      description,
      category,
      type,
      date,
      paymentMethod,
      isRecurrent: false,
    });
  };

  return (
    <View className="space-y-6">
      {/* Botões de Tipo */}
      <View className="flex-row bg-slate-100 p-1.5 rounded-3xl">
        <TouchableOpacity 
          onPress={() => setType(TransactionType.EXPENSE)}
          className={`flex-1 py-3.5 rounded-2xl items-center ${type === TransactionType.EXPENSE ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-sm font-bold ${type === TransactionType.EXPENSE ? 'text-rose-500' : 'text-slate-400'}`}>Despesa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setType(TransactionType.INCOME)}
          className={`flex-1 py-3.5 rounded-2xl items-center ${type === TransactionType.INCOME ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-sm font-bold ${type === TransactionType.INCOME ? 'text-emerald-500' : 'text-slate-400'}`}>Receita</Text>
        </TouchableOpacity>
      </View>

      {/* Input de Valor */}
      <View className="items-center py-4">
        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Valor Total</Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-2xl font-bold text-slate-300">R$</Text>
          <TextInput 
            keyboardType="numeric"
            placeholder="0,00"
            value={amount}
            onChangeText={setAmount}
            className="text-5xl font-bold text-slate-800 w-56 text-center"
            placeholderTextColor="#e2e8f0"
          />
        </View>
      </View>

      {/* Formulário */}
      <View className="space-y-5">
        <View>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Descrição</Text>
          <TextInput 
            placeholder="Ex: Supermercado"
            value={description}
            onChangeText={setDescription}
            className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-800"
          />
        </View>

        {/* Categoria e Data - Adaptação simplificada */}
        <View className="flex-row gap-4">
            {/* Em RN normalmente usamos um Modal ou Picker para Select, aqui simplificado */}
             <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase mb-2">Categoria</Text>
                <View className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <Text className="text-slate-700 font-bold">{category || 'Selecione'}</Text>
                </View>
             </View>
             
             <View className="flex-1">
                <Text className="text-[10px] font-bold text-slate-400 uppercase mb-2">Data</Text>
                <TextInput 
                  value={date}
                  onChangeText={setDate}
                  placeholder="AAAA-MM-DD"
                  className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-700 font-bold"
                />
             </View>
        </View>
      </View>

      {/* Botões de Ação */}
      <View className="flex-row gap-4 pt-6 pb-10">
        <TouchableOpacity onPress={onCancel} className="flex-1 py-4 items-center">
          <Text className="font-bold text-slate-400">Voltar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isProcessingIA}
          className={`flex-[2] py-4 rounded-3xl items-center shadow-lg ${type === TransactionType.EXPENSE ? 'bg-rose-500' : 'bg-emerald-500'}`}
        >
          {isProcessingIA ? (
            <Loader2 size={20} color="#FFF" />
          ) : (
            <Text className="text-white font-bold">Confirmar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TransactionForm;