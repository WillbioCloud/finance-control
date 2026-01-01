import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  ActivityIndicator, 
  Alert, 
  Switch, 
  KeyboardAvoidingView, 
  Platform,
  StyleSheet 
} from 'react-native';
import { TransactionType, PaymentMethod, Category } from '../types';
import { 
  ChevronDown, 
  Calendar, 
  CreditCard, 
  Wallet, 
  Banknote, 
  Sparkles, 
  Check, 
  ListChecks, 
  X, 
  Repeat, 
  ArrowDownCircle, 
  ArrowUpCircle 
} from 'lucide-react-native';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Props {
  categories: Category[];
  onAdd: (t: any) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<Props> = ({ categories = [], onAdd, onCancel }) => {
  // =======================
  // ESTADOS
  // =======================
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('0,00'); 
  const [rawValue, setRawValue] = useState(0); 
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT);
  
  const [detailsText, setDetailsText] = useState('');
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'fixed' | 'installments'>('fixed');

  // =======================
  // LÓGICA (Mantida idêntica à versão estável)
  // =======================
  const availableCategories = useMemo(() => {
    return categories.filter(c => c.type === type);
  }, [categories, type]);

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString('pt-BR'));
    
    // Seleção inicial segura
    const initialCats = categories.filter(c => c.type === TransactionType.EXPENSE);
    if (initialCats.length > 0) {
      setSelectedCategoryId(initialCats[0].id);
    }
  }, []);

  // --- HANDLERS ---

  const handleTypeChange = (newType: TransactionType) => {
    if (newType === type) return;
    setType(newType);
    
    // Tenta selecionar automaticamente a primeira categoria do novo tipo
    const newCats = categories.filter(c => c.type === newType);
    if (newCats.length > 0) {
      setSelectedCategoryId(newCats[0].id);
    } else {
      setSelectedCategoryId('');
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
      Alert.alert("Aviso IA", "Não foi possível processar automaticamente.");
      return null;
    } finally {
      setIsProcessingIA(false);
    }
  };

  const handleSubmit = async () => {
    if (rawValue <= 0 || !description.trim()) {
      Alert.alert("Atenção", "Preencha valor e descrição.");
      return;
    }

    if (!selectedCategoryId && availableCategories.length === 0) {
      Alert.alert("Erro", `Crie uma categoria de ${type === TransactionType.INCOME ? 'Receita' : 'Despesa'} antes.`);
      return;
    }

    const parts = date.split('/');
    if (parts.length !== 3) {
      Alert.alert("Data Inválida", "Use DD/MM/AAAA");
      return;
    }
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    let finalDetails = undefined;
    if (showDetailsInput && detailsText.trim().length > 0) {
      finalDetails = await processDetailsWithIA();
    }

    onAdd({
      amount: rawValue,
      description,
      category: selectedCategory?.name || 'Geral', 
      type,
      date: formattedDate,
      paymentMethod,
      isRecurrent,
      recurrenceType: isRecurrent ? recurrenceType : undefined,
      details: finalDetails 
    });
  };

  // =======================
  // UI HELPERS (CORES)
  // =======================
  const isExpense = type === TransactionType.EXPENSE;
  
  // Cores Hexadecimais (Slate, Red, Emerald do Tailwind)
  const colors = {
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate700: '#334155',
    slate800: '#1e293b',
    red50: '#fef2f2',
    red200: '#fecaca',
    red500: '#ef4444',
    red600: '#dc2626',
    emerald50: '#ecfdf5',
    emerald200: '#a7f3d0',
    emerald500: '#10b981',
    emerald600: '#059669',
    white: '#ffffff',
  };

  const activeColor = isExpense ? colors.red500 : colors.emerald500;
  const activeBgColor = isExpense ? colors.red500 : colors.emerald500;
  const activeLightBg = isExpense ? colors.red50 : colors.emerald50;
  const activeBorderColor = isExpense ? colors.red200 : colors.emerald200;
  const activeTextColor = isExpense ? colors.red500 : colors.emerald500;

  // =======================
  // RENDER
  // =======================
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.contentContainer}>
        
        {/* ABAS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            onPress={() => handleTypeChange(TransactionType.EXPENSE)}
            style={[
              styles.tabButton, 
              isExpense ? styles.activeTabShadow : null,
              { backgroundColor: isExpense ? colors.white : 'transparent' }
            ]}
          >
            <ArrowDownCircle size={20} color={isExpense ? colors.red500 : colors.slate400} />
            <Text style={[styles.tabText, { color: isExpense ? colors.red500 : colors.slate400 }]}>Despesa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleTypeChange(TransactionType.INCOME)}
            style={[
              styles.tabButton, 
              !isExpense ? styles.activeTabShadow : null,
              { backgroundColor: !isExpense ? colors.white : 'transparent' }
            ]}
          >
            <ArrowUpCircle size={20} color={!isExpense ? colors.emerald500 : colors.slate400} />
            <Text style={[styles.tabText, { color: !isExpense ? colors.emerald500 : colors.slate400 }]}>Receita</Text>
          </TouchableOpacity>
        </View>

        {/* VALOR */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>
             {isExpense ? 'VALOR A PAGAR' : 'VALOR A RECEBER'}
          </Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currencySymbol, { color: activeTextColor }]}>R$</Text>
            <TextInput 
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              style={[styles.amountInput, { color: activeTextColor }]}
              placeholder="0,00"
              placeholderTextColor="#cbd5e1"
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.formGap}>
            
            {/* DESCRIÇÃO */}
            <View>
              <Text style={styles.label}>DESCRIÇÃO</Text>
              <View style={styles.inputContainer}>
                <ListChecks size={22} color={colors.slate400} />
                <TextInput 
                  value={description}
                  onChangeText={setDescription}
                  placeholder={isExpense ? "Ex: Mercado..." : "Ex: Salário..."}
                  style={styles.input}
                  placeholderTextColor={colors.slate400}
                />
              </View>
            </View>

            {/* CATEGORIA E DATA (LADO A LADO) */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>CATEGORIA</Text>
                <TouchableOpacity 
                  onPress={() => setShowCategoryModal(true)}
                  style={[
                    styles.inputContainer, 
                    { justifyContent: 'space-between', paddingRight: 12 },
                    !selectedCategoryId && styles.dashedBorder
                  ]}
                >
                  <Text 
                    style={[styles.inputText, !selectedCategory && styles.placeholderText]} 
                    numberOfLines={1}
                  >
                    {selectedCategory?.name || 'Selecione...'}
                  </Text>
                  <ChevronDown size={18} color={colors.slate400} />
                </TouchableOpacity>
              </View>

              <View style={[styles.flex1, { marginLeft: 12 }]}>
                <Text style={styles.label}>DATA</Text>
                <View style={styles.inputContainer}>
                  <Calendar size={18} color={colors.slate400} />
                  <TextInput 
                    value={date}
                    onChangeText={handleDateChange}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    maxLength={10}
                    style={styles.input}
                    placeholderTextColor={colors.slate400}
                  />
                </View>
              </View>
            </View>

            {/* PAGAMENTO */}
            <View>
              <Text style={styles.label}>
                 {isExpense ? 'MÉTODO DE PAGAMENTO' : 'RECEBIDO VIA'}
              </Text>
              <View style={styles.row}>
                {[
                  { id: PaymentMethod.DEBIT, label: 'Débito', icon: Wallet },
                  { id: PaymentMethod.CREDIT, label: 'Crédito', icon: CreditCard },
                  { id: PaymentMethod.CASH, label: 'Dinheiro', icon: Banknote },
                ].map((item) => {
                    const isActive = paymentMethod === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setPaymentMethod(item.id)}
                        style={[
                          styles.paymentButton,
                          isActive 
                            ? { backgroundColor: activeLightBg, borderColor: activeBorderColor } 
                            : { backgroundColor: colors.white, borderColor: colors.slate200 }
                        ]}
                      >
                        <item.icon 
                          size={16} 
                          color={isActive ? (isExpense ? colors.red600 : colors.emerald600) : colors.slate400} 
                        />
                        <Text style={[
                          styles.paymentText,
                          { color: isActive ? (isExpense ? colors.red600 : colors.emerald600) : colors.slate500 }
                        ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                })}
              </View>
            </View>

            {/* RECORRÊNCIA */}
            <View style={styles.recurrenceContainer}>
              <View style={styles.recurrenceLeft}>
                <View style={[styles.iconCircle, { backgroundColor: isExpense ? colors.red50 : colors.emerald50 }]}>
                   <Repeat size={18} color={activeColor} />
                </View>
                <Text style={styles.recurrenceText}>
                   {isExpense ? 'Repetir Despesa?' : 'Repetir Receita?'}
                </Text>
              </View>
              <Switch 
                value={isRecurrent} 
                onValueChange={setIsRecurrent}
                trackColor={{ true: activeColor, false: colors.slate200 }}
              />
            </View>

            {/* IA */}
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity 
                onPress={() => setShowDetailsInput(!showDetailsInput)}
                style={styles.iaButton}
              >
                <Sparkles size={16} color={activeColor} />
                <Text style={[styles.iaButtonText, { color: activeTextColor }]}>
                   {showDetailsInput ? 'Ocultar Leitura IA' : 'Ler Detalhes com IA'}
                </Text>
              </TouchableOpacity>
              
              {showDetailsInput && (
                <View style={[styles.iaInputContainer, { borderColor: activeBorderColor, backgroundColor: activeLightBg }]}>
                  <TextInput 
                    multiline
                    placeholder="Cole o texto da nota fiscal aqui..."
                    style={styles.iaInput}
                    textAlignVertical="top"
                    value={detailsText}
                    onChangeText={setDetailsText}
                    placeholderTextColor={colors.slate500}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={isProcessingIA} 
            style={[styles.saveButton, { backgroundColor: activeBgColor, opacity: isProcessingIA ? 0.7 : 1 }]}
          >
            {isProcessingIA ? <ActivityIndicator color="white" size="small" /> : <Check size={20} color="white" />}
            <Text style={styles.saveButtonText}>{isProcessingIA ? 'Lendo...' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>

        {/* MODAL CATEGORIAS */}
        <Modal visible={showCategoryModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecione</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={styles.closeButton}>
                   <X size={24} color={colors.slate500} />
                </TouchableOpacity>
              </View>
              
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat, idx) => (
                    <TouchableOpacity 
                      key={`${cat.id}-${idx}`}
                      onPress={() => { setSelectedCategoryId(cat.id); setShowCategoryModal(false); }}
                      style={[
                        styles.categoryItem,
                        selectedCategoryId === cat.id 
                          ? { borderColor: activeBorderColor, backgroundColor: activeLightBg } 
                          : { borderColor: colors.slate100, backgroundColor: colors.white }
                      ]}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                         <Text style={styles.categoryLetter}>{cat.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      {selectedCategoryId === cat.id && <Check size={24} color={activeColor} />}
                    </TouchableOpacity>
                  ))
                ) : (
                   <View style={styles.emptyState}>
                      <ListChecks size={48} color={colors.slate400} />
                      <Text style={styles.emptyTitle}>Nenhuma categoria!</Text>
                      <Text style={styles.emptySubtitle}>
                        Crie uma categoria em configurações.
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

// =======================
// FOLHA DE ESTILOS (CSS PURO)
// =======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  formGap: {
    paddingHorizontal: 4,
    gap: 16,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f1f5f9', // slate-100
    padding: 6,
    borderRadius: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  activeTabShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Amount
  amountContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amountLabel: {
    color: '#94a3b8', // slate-400
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    minWidth: 150,
    textAlign: 'center',
  },
  // Inputs
  label: {
    fontSize: 12,
    color: '#94a3b8', // slate-400
    fontWeight: 'bold',
    marginLeft: 4,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#f8fafc', // slate-50
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    height: 60,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b', // slate-800
  },
  inputText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155', // slate-700
    flex: 1,
  },
  placeholderText: {
    color: '#94a3b8', // slate-400
    fontStyle: 'italic',
  },
  dashedBorder: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  // Layout Helpers
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  // Payment
  paymentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Recurrence
  recurrenceContainer: {
    backgroundColor: '#f8fafc', // slate-50
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  recurrenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    padding: 8,
    borderRadius: 999,
  },
  recurrenceText: {
    color: '#334155', // slate-700
    fontWeight: 'bold',
    fontSize: 14,
  },
  // IA
  iaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 8,
  },
  iaButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  iaInputContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iaInput: {
    height: 80,
    color: '#334155', // slate-700
    fontSize: 14,
    lineHeight: 20,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9', // slate-100
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#f1f5f9', // slate-100
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: 'bold',
    color: '#64748b', // slate-500
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 18,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: '70%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9', // slate-100
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#1e293b', // slate-800
  },
  closeButton: {
    backgroundColor: '#f1f5f9', // slate-100
    padding: 8,
    borderRadius: 999,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLetter: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  categoryName: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e293b', // slate-800
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    opacity: 0.5,
  },
  emptyTitle: {
    marginTop: 16,
    color: '#94a3b8', // slate-400
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: '#94a3b8', // slate-400
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
});

export default TransactionForm;