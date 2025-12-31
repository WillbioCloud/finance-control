import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { TransactionType, PaymentMethod, Category } from '../types';
import { ChevronDown, Calendar, CreditCard, Wallet, Banknote, Sparkles, Check, ListChecks, X, Repeat, ArrowDownCircle, ArrowUpCircle } from 'lucide-react-native';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Props {
  categories: Category[];
  onAdd: (t: any) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<Props> = ({ categories, onAdd, onCancel }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('0,00'); 
  const [rawValue, setRawValue] = useState(0); 
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  
  const currentCategories = categories.filter(c => c.type === type);
  const [category, setCategory] = useState<Category | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT);
  
  const [detailsText, setDetailsText] = useState('');
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'fixed' | 'installments'>('fixed');

  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString('pt-BR'));
    if (currentCategories.length > 0) setCategory(currentCategories[0]);
    else setCategory(null);
  }, [type]);

  const handleAmountChange = (text: string) => {
    const cleanValue = text.replace(/\D/g, '');
    const numberValue = parseInt(cleanValue || '0') / 100;
    setRawValue(numberValue);
    setAmount(numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  };

  const handleDateChange = (text: string) => {
    let clean = text.replace(/\D/g, '');
    if (clean.length > 8) clean = clean.substring(0, 8);
    let formatted = clean;
    if (clean.length >= 3) formatted = `${clean.substring(0, 2)}/${clean.substring(2)}`;
    if (clean.length >= 5) formatted = `${formatted.substring(0, 5)}/${clean.substring(4)}`;
    setDate(formatted);
  };

  const processDetailsWithIA = async () => {
    if (!detailsText.trim()) return null;
    setIsProcessingIA(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Chave de API não configurada");

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // ALTERADO: Usando 'gemini-flash-latest' que apareceu na sua lista de modelos disponíveis
      // Esse alias costuma apontar para a versão estável (1.5 Flash) com melhor cota gratuita
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `
        Analise o texto: "${detailsText}".
        Extraia os itens comprados em JSON.
        Formato estrito: [{"item": "Nome", "amount": 0.00, "quantity": "1 un"}]
        Responda APENAS o JSON puro.
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);

    } catch (error: any) {
      console.error("Erro IA:", error);
      
      let msg = "Erro ao processar.";
      if (error.message?.includes('429')) {
        msg = "Limite de uso gratuito da IA atingido. Aguarde alguns instantes e tente novamente.";
      } else if (error.message?.includes('404')) {
        msg = "Modelo não encontrado. Tente verificar sua chave de API.";
      } else if (error.message?.includes('403')) {
        msg = "Acesso negado. Verifique as restrições da sua chave API.";
      }

      Alert.alert("Aviso IA", msg);
      return null;
    } finally {
      setIsProcessingIA(false);
    }
  };

  const handleSubmit = async () => {
    if (rawValue <= 0 || !description) {
      Alert.alert("Atenção", "Preencha valor e descrição.");
      return;
    }

    const parts = date.split('/');
    if (parts.length !== 3) {
      Alert.alert("Data Inválida", "Use DD/MM/AAAA");
      return;
    }
    const [day, month, year] = parts;
    const formattedDate = `${year}-${month}-${day}`;

    let finalDetails = undefined;
    if (showDetailsInput && detailsText.trim().length > 0) {
      finalDetails = await processDetailsWithIA();
    }

    onAdd({
      amount: rawValue,
      description,
      category: category?.name || 'Geral',
      type,
      date: formattedDate,
      paymentMethod,
      isRecurrent,
      recurrenceType: isRecurrent ? recurrenceType : undefined,
      details: finalDetails 
    });
  };

  const isExpense = type === TransactionType.EXPENSE;
  const activeBg = isExpense ? 'bg-red-500' : 'bg-emerald-500';

  const paymentOptions = [
    { id: PaymentMethod.DEBIT, label: 'Débito', icon: Wallet },
    { id: PaymentMethod.CREDIT, label: 'Crédito', icon: CreditCard },
    { id: PaymentMethod.CASH, label: 'Dinheiro', icon: Banknote },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <View className="flex-1 pb-6">
        
        {/* Seletor */}
        <View className="flex-row mb-6 bg-slate-100 p-1 rounded-xl">
          <TouchableOpacity onPress={() => setType(TransactionType.EXPENSE)} className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${isExpense ? 'bg-white shadow-sm' : ''}`}>
            <ArrowDownCircle size={20} color={isExpense ? '#ef4444' : '#94a3b8'} />
            <Text className={`font-bold ${isExpense ? 'text-red-500' : 'text-slate-400'}`}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setType(TransactionType.INCOME)} className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${!isExpense ? 'bg-white shadow-sm' : ''}`}>
            <ArrowUpCircle size={20} color={!isExpense ? '#10b981' : '#94a3b8'} />
            <Text className={`font-bold ${!isExpense ? 'text-emerald-500' : 'text-slate-400'}`}>Receita</Text>
          </TouchableOpacity>
        </View>

        {/* Valor */}
        <View className="items-center mb-8">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Valor Total</Text>
          <View className="flex-row items-center">
            <Text className={`text-3xl font-bold mr-2 ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>R$</Text>
            <TextInput value={amount} onChangeText={handleAmountChange} keyboardType="numeric" className={`text-5xl font-bold ${isExpense ? 'text-red-500' : 'text-emerald-500'} min-w-[150px] text-center`} placeholder="0,00" placeholderTextColor="#cbd5e1" />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="space-y-4">
            {/* Descrição */}
            <View>
              <Text className="text-xs text-slate-400 font-bold ml-1 mb-1">DESCRIÇÃO</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-xl flex-row items-center p-3 gap-3">
                <ListChecks size={20} color="#94a3b8" />
                <TextInput value={description} onChangeText={setDescription} placeholder="Ex: Supermercado..." className="flex-1 text-base font-medium text-slate-800" />
              </View>
            </View>

            {/* Categoria e Data */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-bold ml-1 mb-1">CATEGORIA</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(true)} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-row items-center justify-between">
                  <Text className="font-bold text-slate-700" numberOfLines={1}>{category?.name || 'Selecione'}</Text>
                  <ChevronDown size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-bold ml-1 mb-1">DATA</Text>
                <View className="bg-slate-50 border border-slate-200 rounded-xl flex-row items-center p-3 gap-2">
                  <Calendar size={18} color="#94a3b8" />
                  <TextInput value={date} onChangeText={handleDateChange} placeholder="DD/MM/AAAA" keyboardType="numeric" maxLength={10} className="flex-1 font-bold text-slate-700" />
                </View>
              </View>
            </View>

            {/* Pagamento */}
            <View>
              <Text className="text-xs text-slate-400 font-bold ml-1 mb-1">PAGAMENTO</Text>
              <View className="flex-row flex-wrap gap-2">
                {paymentOptions.map((item) => {
                  const isActive = paymentMethod === item.id;
                  return (
                    <TouchableOpacity key={item.id} onPress={() => setPaymentMethod(item.id)} className={`px-4 py-2.5 rounded-lg border ${isActive ? (isExpense ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200') : 'bg-white border-slate-200'}`}>
                      <View className="flex-row items-center gap-2">
                        <item.icon size={16} color={isActive ? (isExpense ? '#dc2626' : '#059669') : '#64748b'} />
                        <Text className={`text-xs font-bold ${isActive ? (isExpense ? 'text-red-600' : 'text-emerald-600') : 'text-slate-500'}`}>{item.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Recorrência */}
            <View className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex-row justify-between items-center mt-2">
              <View className="flex-row items-center gap-2">
                <Repeat size={18} color="#64748b" />
                <Text className="text-slate-600 font-bold text-sm">Repetir mensalmente?</Text>
              </View>
              <Switch value={isRecurrent} onValueChange={setIsRecurrent} trackColor={{ true: isExpense ? '#ef4444' : '#10b981' }} />
            </View>

            {/* IA Detalhes */}
            <View>
              <TouchableOpacity onPress={() => setShowDetailsInput(!showDetailsInput)} className="flex-row items-center gap-2 py-2">
                <Sparkles size={16} color={isExpense ? '#ef4444' : '#10b981'} />
                <Text className={`text-xs font-bold ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                   {showDetailsInput ? 'Esconder Leitura Inteligente' : 'Detalhar com IA'}
                </Text>
              </TouchableOpacity>
              
              {showDetailsInput && (
                <View className="p-3 rounded-xl border border-slate-100 bg-white">
                  <TextInput 
                    multiline
                    placeholder="Cole aqui o texto da nota fiscal..."
                    className="h-24 text-slate-700 text-sm leading-5"
                    textAlignVertical="top"
                    value={detailsText}
                    onChangeText={setDetailsText}
                  />
                  <Text className="text-[10px] text-slate-400 mt-2 text-right">A IA separará os itens ao clicar em Salvar.</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View className="flex-row gap-3 pt-4 border-t border-slate-100 mt-2">
          <TouchableOpacity onPress={onCancel} className="flex-1 py-4 bg-slate-100 rounded-xl items-center">
            <Text className="font-bold text-slate-500">Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} disabled={isProcessingIA} className={`flex-[2] py-4 rounded-xl items-center flex-row justify-center gap-2 ${activeBg} ${isProcessingIA ? 'opacity-70' : ''}`}>
            {isProcessingIA ? <ActivityIndicator color="white" size="small" /> : <Check size={20} color="white" />}
            <Text className="font-bold text-white text-base">{isProcessingIA ? 'Lendo IA...' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showCategoryModal} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl h-2/3">
              <View className="p-4 border-b border-slate-100 flex-row justify-between items-center">
                <Text className="font-bold text-lg text-slate-800">Categorias</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)} className="bg-slate-100 p-2 rounded-full"><X size={20} color="#64748b" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16 }}>
                {currentCategories.map((cat, idx) => (
                  <TouchableOpacity key={`${cat.id}-${idx}`} onPress={() => { setCategory(cat); setShowCategoryModal(false); }} className="flex-row items-center gap-4 p-4 border-b border-slate-50">
                    <View className={`w-10 h-10 rounded-full ${cat.color} items-center justify-center`}><Text className="font-bold">{cat.name.charAt(0)}</Text></View>
                    <Text className={`flex-1 font-bold text-base ${category?.id === cat.id ? 'text-slate-900' : 'text-slate-600'}`}>{cat.name}</Text>
                    {category?.id === cat.id && <Check size={20} color={isExpense ? '#ef4444' : '#10b981'} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
};

export default TransactionForm;