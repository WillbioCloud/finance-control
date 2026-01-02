import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView 
} from 'react-native';
import { Transaction, Category, TransactionType, TransactionDetail } from '../types';
import { TrendingUp, TrendingDown, Trash2, ShoppingBag, ChevronUp, DollarSign, Edit2, Sparkles, X, Check } from 'lucide-react-native';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- HELPER ---
const groupDetailsByCategory = (details: TransactionDetail[] = []) => {
  const groups: Record<string, TransactionDetail[]> = {};
  details.forEach(item => {
    const cat = item.category || 'Geral';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
};

// --- ITEM DA LISTA ---
export const TransactionItem = ({ 
  t, 
  onDelete, 
  onEdit, 
  cat 
}: { 
  t: Transaction, 
  onDelete: (id: string) => void, 
  onEdit: (t: Transaction) => void,
  cat?: Category 
}) => {
  const [expanded, setExpanded] = useState(false);
  const isExpense = t.type === TransactionType.EXPENSE;
  const hasDetails = t.details && t.details.length > 0;
  const groupedDetails = hasDetails ? groupDetailsByCategory(t.details) : {};

  const handleDelete = () => {
    Alert.alert("Excluir", "Apagar transação?", [{ text: "Cancelar" }, { text: "Apagar", style: "destructive", onPress: () => onDelete(t.id) }]);
  };

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity 
        onPress={() => hasDetails && setExpanded(!expanded)} 
        activeOpacity={hasDetails ? 0.7 : 1}
        style={styles.itemContainer}
      >
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: cat?.color || '#e2e8f0' }]}>
            {isExpense ? <TrendingDown size={18} color="#fff" /> : <TrendingUp size={18} color="#fff" />}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.description} numberOfLines={1}>{t.description}</Text>
            <View style={styles.categoryRow}>
              <Text style={styles.category}>{cat?.name || t.category}</Text>
              {hasDetails && (
                <View style={styles.detailsBadge}>
                  <ShoppingBag size={10} color="#64748b" />
                  <Text style={styles.detailsBadgeText}>Itens</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.rightActions}>
          <View style={styles.rightContent}>
            <Text style={[styles.amount, { color: isExpense ? '#ef4444' : '#10b981' }]}>
              {isExpense ? '-' : '+'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.date}>{t.date.split('-').reverse().join('/')}</Text>
          </View>
          
          {/* Botões de Ação */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => onEdit(t)} style={styles.iconButton}>
              <Edit2 size={16} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Detalhes Expandidos */}
      {expanded && hasDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>ITENS DA NOTA</Text>
            <TouchableOpacity onPress={() => setExpanded(false)}><ChevronUp size={14} color="#94a3b8" /></TouchableOpacity>
          </View>
          {Object.entries(groupedDetails).map(([category, items], idx) => (
            <View key={idx} style={styles.groupContainer}>
              <Text style={styles.groupTitle}>{category}</Text>
              {items.map((item, index) => (
                <View key={index} style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailItemText}>{item.item}</Text>
                    <Text style={styles.calcText}>{item.quantity || '1'} x R$ {item.unitPrice?.toFixed(2)}</Text>
                  </View>
                  <Text style={styles.detailAmountText}>R$ {item.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onUpdate: (t: Transaction) => void; // NOVO PROP
}

const TransactionsList: React.FC<Props> = ({ transactions, categories, onDelete, onUpdate }) => {
  // Estados do Modal de Edição/Detalhamento
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailsText, setDetailsText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenDetail = (t: Transaction) => {
    setSelectedTx(t);
    setDetailsText('');
    setShowDetailModal(true);
  };

  const processDetails = async () => {
    if (!detailsText.trim() || !selectedTx) return;
    setIsProcessing(true);
    
    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Chave de API não configurada");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = `
        Analise esta lista de itens de uma compra: "${detailsText}".
        Identifique o nome do item, quantidade e PREÇO UNITÁRIO.
        Gere um JSON estrito: [{ "item": "Nome", "quantity": "1 un", "unitPrice": 10.00, "amount": 10.00, "category": "Categoria Sugerida" }]
      `;
      
      const result = await model.generateContent(prompt);
      let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedDetails = JSON.parse(text);
      
      // Atualiza a transação com os novos detalhes
      const updatedTx = { ...selectedTx, details: parsedDetails };
      
      // Opcional: Atualizar o valor total se a soma dos itens for diferente?
      // Por segurança, vamos manter o valor original ou alertar o usuário. 
      // Aqui, vamos apenas salvar os detalhes.
      
      onUpdate(updatedTx);
      setShowDetailModal(false);
      Alert.alert("Sucesso", "Detalhes adicionados com IA!");

    } catch (error) {
      Alert.alert("Erro IA", "Não foi possível processar os detalhes.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Extrato Completo</Text>
        <Text style={styles.subtitle}>{transactions.length} registros</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionItem 
            t={item} 
            onDelete={onDelete} 
            onEdit={handleOpenDetail} // Conecta ao Modal
            cat={categories.find(c => c.name === item.category)} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 24, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <DollarSign size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          </View>
        }
      />

      {/* --- MODAL DE DETALHAMENTO --- */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhar Transação</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeButton}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{padding: 20}}>
              <Text style={styles.txInfoLabel}>Transação Selecionada:</Text>
              <Text style={styles.txInfoValue}>{selectedTx?.description} - R$ {selectedTx?.amount.toFixed(2)}</Text>
              
              <Text style={styles.label}>Cole os detalhes da nota/fatura:</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  multiline 
                  style={styles.input} 
                  placeholder="Ex: 2x Arroz R$ 20,00, 1x Feijão R$ 8,00..."
                  value={detailsText}
                  onChangeText={setDetailsText}
                  textAlignVertical="top"
                />
              </View>
              
              <TouchableOpacity 
                onPress={processDetails} 
                disabled={isProcessing}
                style={styles.aiButton}
              >
                {isProcessing ? <ActivityIndicator color="#fff" /> : <Sparkles size={20} color="#fff" />}
                <Text style={styles.aiButtonText}>
                  {isProcessing ? "Lendo com IA..." : "Processar e Salvar"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: { flex: 1, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { color: '#64748b', fontSize: 14 },
  
  cardWrapper: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 8, overflow: 'hidden' },
  itemContainer: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  textContainer: { flex: 1 },
  description: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  category: { color: '#64748b', fontSize: 12 },
  detailsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  detailsBadgeText: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },
  
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rightContent: { alignItems: 'flex-end' },
  amount: { fontWeight: 'bold', fontSize: 14 },
  date: { color: '#94a3b8', fontSize: 10, fontWeight: '600' },
  
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  iconButton: { padding: 4 },

  detailsContainer: { backgroundColor: '#f8fafc', padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailsTitle: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  groupContainer: { marginBottom: 16 },
  groupTitle: { fontSize: 11, fontWeight: 'bold', color: '#6366f1', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  detailItemText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  calcText: { fontSize: 11, color: '#64748b', marginTop: 1 },
  detailAmountText: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
  emptyText: { color: '#94a3b8', fontSize: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '60%' },
  modalHeader: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontWeight: 'bold', fontSize: 18, color: '#1e293b' },
  closeButton: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  txInfoLabel: { fontSize: 12, color: '#64748b', fontWeight: 'bold', marginBottom: 4 },
  txInfoValue: { fontSize: 16, color: '#1e293b', fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  inputContainer: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, height: 120, marginBottom: 24 },
  input: { flex: 1, fontSize: 16, color: '#1e293b', textAlignVertical: 'top' },
  aiButton: { backgroundColor: '#8b5cf6', paddingVertical: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  aiButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default TransactionsList;