import React, { useState, useEffect, useMemo } from 'react';
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
  // --- Estados ---
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('0,00'); 
  const [rawValue, setRawValue] = useState(0); 
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  
  // OTIMIZAÇÃO: Filtra categorias apenas quando necessário (evita recálculos no render)
  const currentCategories = useMemo(() => 
    categories.filter(c => c.type === type), 
    [categories, type]
  );

  const [category, setCategory] = useState<Category | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT);
  
  // IA
  const [detailsText, setDetailsText] = useState('');
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Recorrência
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'fixed' | 'installments'>('fixed');

  // --- EFEITOS (Apenas Inicialização) ---
  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString('pt-BR'));
    
    // Define categoria inicial apenas ao abrir a tela pela primeira vez
    const initialCats = categories.filter(c => c.type === TransactionType.EXPENSE);
    if (initialCats.length > 0) {
      setCategory(initialCats[0]);
    }
  }, []); // Array vazio = roda apenas uma vez (sem loops)

  // --- HANDLER SEGURO (Evita o travamento) ---
  const handleTypeChange = (newType: TransactionType) => {
    // 1. Atualiza o tipo visualmente
    setType(newType);
    
    // 2. Busca as categorias do novo tipo imediatamente
    const availableCats = categories.filter(c => c.type === newType);
    
    // 3. Define a nova categoria sem depender de useEffect
    if (availableCats.length > 0) {
      setCategory(availableCats[0]);
    } else {
      setCategory(null);
    }
  };

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
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `
        Analise o texto: "${detailsText}".
        Extraia os itens em JSON.
        Formato: [{"item": "Nome", "amount": 0.00, "quantity": "1 un"}]
        Responda APENAS JSON puro.
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);

    } catch (error: any) {
      console.error("Erro IA:", error);
      Alert.alert("Aviso IA", "Não foi possível processar automaticamente. Verifique sua conexão.");
      return null;
    } finally {
      setIsProcessingIA(false);
    }
  };

  const handleSubmit = async () => {
    if (rawValue <= 0 || !description) {
      Alert.alert("Campos Obrigatórios", "Informe o valor e a descrição.");
      return;
    }

    // Validação de segurança para não salvar sem categoria
    if (!category && currentCategories.length === 0) {
      Alert.alert(
        "Atenção", 
        `Você não tem categorias de ${type === TransactionType.INCOME ? 'Receita' : 'Despesa'} cadastradas. Crie uma antes de salvar.`
      );
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
      // Fallback seguro caso category seja null (evita crash)
      category: category ? category.name : 'Geral',
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
  const activeLightBg = isExpense ? 'bg-red-50' : 'bg-emerald-50';
  const activeBorder = isExpense ? 'border-red-200' : 'border-emerald-200';
  const activeText = isExpense ? 'text-red-500' : 'text-emerald-500';
  const activeColor = isExpense ? '#ef4444' : '#10b981';

  const paymentOptions = [
    { id: PaymentMethod.DEBIT, label: 'Débito', icon: Wallet },
    { id: PaymentMethod.CREDIT, label: 'Crédito', icon: CreditCard },
    { id: PaymentMethod.CASH, label: 'Dinheiro', icon: Banknote },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <View className="flex-1 pb-6">
        
        {/* 1. SELETOR DE TIPO (USANDO O NOVO HANDLER SEGURO) */}
        <View className="flex-row mb-6 bg-slate-100 p-1.5 rounded-2xl">
          <TouchableOpacity 
            onPress={() => handleTypeChange(TransactionType.EXPENSE)}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl ${isExpense ? 'bg-white shadow-sm' : ''}`}
          >
            <ArrowDownCircle size={20} color={isExpense ? '#ef4444' : '#94a3b8'} />
            <Text className={`font-bold text-base ${isExpense ? 'text-red-500' : 'text-slate-400'}`}>Despesa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleTypeChange(TransactionType.INCOME)}
            className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl ${!isExpense ? 'bg-white shadow-sm' : ''}`}
          >
            <ArrowUpCircle size={20} color={!isExpense ? '#10b981' : '#94a3b8'} />
            <Text className={`font-bold text-base ${!isExpense ? 'text-emerald-500' : 'text-slate-400'}`}>Receita</Text>
          </TouchableOpacity>
        </View>

        {/* 2. VALOR */}
        <View className="items-center mb-8">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
             {isExpense ? 'Valor a Pagar' : 'Valor a Receber'}
          </Text>
          <View className="flex-row items-center">
            <Text className={`text-3xl font-bold mr-2 ${activeText}`}>R$</Text>
            <TextInput 
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              className={`text-5xl font-bold ${activeText} min-w-[150px] text-center`}
              placeholder="0,00"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="space-y-4 px-1">
            
            {/* Descrição */}
            <View>
              <Text className="text-xs text-slate-400 font-bold ml-1 mb-2">DESCRIÇÃO</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-2xl flex-row items-center p-4 gap-3">
                <ListChecks size={22} color="#94a3b8" />
                <TextInput 
                  value={description}
                  onChangeText={setDescription}
                  placeholder={isExpense ? "Ex: Supermercado..." : "Ex: Salário, Venda..."}
                  className="flex-1 text-base font-medium text-slate-800"
                  placeholderTextColor="#cbd5e1"
                />
              </View>
            </View>

            {/* Categoria e Data */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-bold ml-1 mb-2">CATEGORIA</Text>
                <TouchableOpacity 
                  onPress={() => setShowCategoryModal(true)}
                  className={`bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between h-[60px] ${!category ? 'border-dashed border-2 border-slate-300' : ''}`}
                >
                  <Text className={`font-bold text-sm ${category ? 'text-slate-700' : 'text-slate-400 italic'}`} numberOfLines={1}>
                    {category?.name || 'Selecione...'}
                  </Text>
                  <ChevronDown size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View className="flex-1">
                <Text className="text-xs text-slate-400 font-bold ml-1 mb-2">DATA</Text>
                <View className="bg-slate-50 border border-slate-200 rounded-2xl flex-row items-center px-4 h-[60px] gap-2">
                  <Calendar size={18} color="#94a3b8" />
                  <TextInput 
                    value={date}
                    onChangeText={handleDateChange}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    maxLength={10}
                    className="flex-1 font-bold text-slate-700 text-sm"
                  />
                </View>
              </View>
            </View>

            {/* Pagamento */}
            <View>
              <Text className="text-xs text-slate-400 font-bold ml-1 mb-2">
                 {isExpense ? 'MÉTODO DE PAGAMENTO' : 'RECEBIDO VIA'}
              </Text>
              <View className="flex-row gap-2">
                {paymentOptions.map((item) => {
                  const isActive = paymentMethod === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setPaymentMethod(item.id)}
                      className={`flex-1 py-3 rounded-xl border flex-row justify-center items-center gap-2 ${isActive ? `${activeLightBg} ${activeBorder}` : 'bg-white border-slate-200'}`}
                    >
                      <item.icon size={16} color={isActive ? (isExpense ? '#dc2626' : '#059669') : '#94a3b8'} />
                      <Text className={`text-xs font-bold ${isActive ? (isExpense ? 'text-red-600' : 'text-emerald-600') : 'text-slate-500'}`}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Recorrência */}
            <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex-row justify-between items-center mt-2">
              <View className="flex-row items-center gap-3">
                <View className={`p-2 rounded-full ${isExpense ? 'bg-red-100' : 'bg-emerald-100'}`}>
                   <Repeat size={18} color={isExpense ? '#ef4444' : '#10b981'} />
                </View>
                <Text className="text-slate-700 font-bold text-sm">
                   {isExpense ? 'Repetir Despesa?' : 'Repetir Receita?'}
                </Text>
              </View>
              <Switch 
                value={isRecurrent} 
                onValueChange={setIsRecurrent}
                trackColor={{ true: activeColor, false: '#e2e8f0' }}
              />
            </View>

            {/* IA */}
            <View className="pt-2">
              <TouchableOpacity 
                onPress={() => setShowDetailsInput(!showDetailsInput)}
                className="flex-row items-center justify-center gap-2 py-3 mb-2"
              >
                <Sparkles size={16} color={activeColor} />
                <Text className={`text-sm font-bold ${activeText}`}>
                   {showDetailsInput ? 'Ocultar Inteligência Artificial' : 'Usar Inteligência Artificial'}
                </Text>
              </TouchableOpacity>
              
              {showDetailsInput && (
                <View className={`p-4 rounded-2xl border ${activeBorder} ${activeLightBg}`}>
                  <TextInput 
                    multiline
                    placeholder={isExpense ? "Cole o texto da nota fiscal..." : "Descreva os itens recebidos..."}
                    className="h-24 text-slate-700 text-sm leading-5"
                    textAlignVertical="top"
                    value={detailsText}
                    onChangeText={setDetailsText}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* RODAPÉ */}
        <View className="flex-row gap-3 pt-4 border-t border-slate-100 mt-2">
          <TouchableOpacity 
            onPress={onCancel} 
            className="flex-1 py-4 bg-slate-100 rounded-2xl items-center"
          >
            <Text className="font-bold text-slate-500">Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={isProcessingIA}
            className={`flex-[2] py-4 rounded-2xl items-center flex-row justify-center gap-2 ${activeBg} ${isProcessingIA ? 'opacity-70' : ''}`}
          >
            {isProcessingIA ? <ActivityIndicator color="white" size="small" /> : <Check size={20} color="white" />}
            <Text className="font-bold text-white text-lg">
              {isProcessingIA ? 'Processando...' : 'Confirmar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODAL CATEGORIAS */}
        <Modal visible={showCategoryModal} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[2.5rem] h-[70%] shadow-2xl">
              <View className="p-6 border-b border-slate-100 flex-row justify-between items-center">
                <Text className="font-bold text-xl text-slate-800">
                   Selecione a Categoria
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)} className="bg-slate-100 p-2 rounded-full">
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                {currentCategories.length > 0 ? (
                  currentCategories.map((cat, idx) => (
                    <TouchableOpacity 
                      key={`${cat.id}-${idx}`}
                      onPress={() => { setCategory(cat); setShowCategoryModal(false); }}
                      className={`flex-row items-center gap-4 p-4 mb-3 rounded-2xl border ${category?.id === cat.id ? activeBorder : 'border-slate-100'} ${category?.id === cat.id ? activeLightBg : 'bg-white'}`}
                    >
                      <View className={`w-12 h-12 rounded-full ${cat.color} items-center justify-center`}>
                         <Text className="font-bold text-lg text-white opacity-90">{cat.name.charAt(0)}</Text>
                      </View>
                      <View className="flex-1">
                         <Text className={`font-bold text-base ${category?.id === cat.id ? 'text-slate-800' : 'text-slate-600'}`}>
                           {cat.name}
                         </Text>
                      </View>
                      {category?.id === cat.id && <Check size={24} color={activeColor} />}
                    </TouchableOpacity>
                  ))
                ) : (
                   <View className="items-center justify-center py-10 opacity-50">
                      <ListChecks size={48} color="#94a3b8" />
                      <Text className="mt-4 text-slate-400 text-center font-bold">
                         Nenhuma categoria encontrada!
                      </Text>
                      <Text className="text-slate-400 text-center text-xs mt-1">
                         Para adicionar uma {isExpense ? 'despesa' : 'receita'}, crie uma categoria antes.
                      </Text>
                   </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
};

export default TransactionForm;