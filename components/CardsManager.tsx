import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, StyleSheet } from 'react-native';
import { CreditCard } from '../types';
import { CreditCard as CardIcon, Plus, X, Trash2, Wallet } from 'lucide-react-native';

interface Props {
  cards: CreditCard[];
  onAddCard: (card: CreditCard) => void;
  onUpdate: (cards: CreditCard[]) => void;
}

const CardsManager: React.FC<Props> = ({ cards, onAddCard, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Estados do Formulário (Preservados no código para uso futuro quando a integração existir)
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  // --- NOVA LÓGICA DE RESTRIÇÃO ---
  const handleAddPress = () => {
    // Verifica se existem dados bancários importados pelo Open Finance.
    // Como a funcionalidade está marcada como "Em Breve" no Perfil, 
    // assumimos que não há dados (false).
    const hasOpenFinanceData = false; 

    if (!hasOpenFinanceData) {
      Alert.alert(
        "Nenhuma informação bancária",
        "Para adicionar cartões, é necessário conectar sua conta bancária via Open Finance na aba Perfil."
      );
      return;
    }

    // Se houvesse dados, abriria o modal de seleção/criação
    setShowModal(true);
  };

  const handleCreate = () => {
    if (!name || !limit || !dueDay) {
      Alert.alert("Erro", "Preencha nome, limite e vencimento.");
      return;
    }

    const newCard: CreditCard = {
      id: Date.now().toString(),
      name,
      bank: bank || 'Banco',
      limit: parseFloat(limit.replace(',', '.')),
      used: 0,
      closingDay: parseInt(closingDay) || 1,
      dueDay: parseInt(dueDay),
      color: '#1e293b'
    };

    if (onUpdate) {
      onUpdate([...cards, newCard]);
    } else if (onAddCard) {
      onAddCard(newCard);
    }
    
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const newCards = cards.filter(c => c.id !== id);
    if (onUpdate) onUpdate(newCards);
  };

  const resetForm = () => {
    setName('');
    setBank('');
    setLimit('');
    setClosingDay('');
    setDueDay('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Meus Cartões</Text>
          <Text style={styles.subtitle}>Gerencie seus limites</Text>
        </View>
        <TouchableOpacity 
          onPress={handleAddPress} // Agora chama a verificação
          style={styles.addButton}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {cards.map(card => {
          const usedPercent = Math.min((card.used / card.limit) * 100, 100);
          const available = card.limit - card.used;

          return (
            <View key={card.id} style={styles.cardContainer}>
               <View style={[styles.cardVisual, { backgroundColor: card.color || '#1e293b' }]}>
                  {/* Decoração */}
                  <View style={styles.decorCircle1} />
                  <View style={styles.decorCircle2} />

                  <View style={styles.cardTop}>
                    <View>
                      <Text style={styles.bankName}>{card.bank}</Text>
                      <Text style={styles.cardName}>{card.name}</Text>
                    </View>
                    <CardIcon color="rgba(255,255,255,0.8)" size={32} />
                  </View>

                  <View>
                    <View style={styles.cardInfoRow}>
                       <Text style={styles.cardDate}>Vence dia {card.dueDay}</Text>
                       <Text style={styles.cardUsed}>R$ {card.used.toLocaleString()}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                       <View style={[styles.progressBarFill, { width: `${usedPercent}%` }]} />
                    </View>
                    <View style={styles.cardLimitsRow}>
                      <Text style={styles.limitText}>Limite: R$ {card.limit.toLocaleString()}</Text>
                      <Text style={styles.availableText}>Disp: R$ {available.toLocaleString()}</Text>
                    </View>
                  </View>
               </View>

               <View style={styles.actionsRow}>
                 <TouchableOpacity 
                    onPress={() => Alert.alert("Excluir", "Remover este cartão?", [{text: "Cancelar"}, {text: "Sim", onPress: () => handleDelete(card.id)}])}
                    style={styles.deleteButton}
                 >
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={styles.deleteText}>Remover</Text>
                 </TouchableOpacity>
               </View>
            </View>
          );
        })}

        {cards.length === 0 && (
          <View style={styles.emptyState}>
            <Wallet size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal mantido no código (mas inacessível pelo usuário por enquanto) */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Novo Cartão</Text>
               <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                 <X size={20} color="#64748b" />
               </TouchableOpacity>
             </View>

             <ScrollView contentContainerStyle={styles.formGap}>
                <View>
                   <Text style={styles.label}>Apelido do Cartão</Text>
                   <TextInput placeholder="Ex: Nubank Black" style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#94a3b8" />
                </View>
                <View>
                   <Text style={styles.label}>Banco Emissor</Text>
                   <TextInput placeholder="Ex: Nubank" style={styles.input} value={bank} onChangeText={setBank} placeholderTextColor="#94a3b8" />
                </View>
                <View>
                   <Text style={styles.label}>Limite Total (R$)</Text>
                   <TextInput placeholder="0,00" keyboardType="numeric" style={styles.input} value={limit} onChangeText={setLimit} placeholderTextColor="#94a3b8" />
                </View>
                <View style={styles.row}>
                  <View style={styles.flex1}>
                     <Text style={styles.label}>Dia Fechamento</Text>
                     <TextInput placeholder="Dia" keyboardType="numeric" style={styles.input} value={closingDay} onChangeText={setClosingDay} maxLength={2} placeholderTextColor="#94a3b8" />
                  </View>
                  <View style={styles.flex1}>
                     <Text style={styles.label}>Dia Vencimento</Text>
                     <TextInput placeholder="Dia" keyboardType="numeric" style={styles.input} value={dueDay} onChangeText={setDueDay} maxLength={2} placeholderTextColor="#94a3b8" />
                  </View>
                </View>

                <TouchableOpacity onPress={handleCreate} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Adicionar Cartão</Text>
                </TouchableOpacity>
             </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 16, marginTop: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { color: '#64748b', fontSize: 14 },
  addButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 24, elevation: 2 },
  list: { paddingBottom: 100, paddingHorizontal: 16, gap: 24 },
  
  cardContainer: { backgroundColor: '#fff', borderRadius: 32, padding: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardVisual: { height: 200, borderRadius: 28, padding: 24, justifyContent: 'space-between', position: 'relative', overflow: 'hidden' },
  decorCircle1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' },
  decorCircle2: { position: 'absolute', bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bankName: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  cardName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  cardUsed: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden', width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.9)' },
  cardLimitsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  limitText: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  availableText: { color: '#6ee7b7', fontSize: 10, fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: 12 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  deleteText: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: '#f8fafc', borderRadius: 24, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16, fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  closeButton: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  formGap: { gap: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  row: { flexDirection: 'row', gap: 16 },
  flex1: { flex: 1 },
  saveButton: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 16, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});

export default CardsManager;