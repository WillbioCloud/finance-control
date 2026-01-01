import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, StyleSheet } from 'react-native';
import { Goal } from '../types';
import { Target, Plus, Trophy, X } from 'lucide-react-native';

interface Props {
  goals: Goal[];
  onUpdate: (goals: Goal[]) => void;
}

const GoalsManager: React.FC<Props> = ({ goals, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [initialAmount, setInitialAmount] = useState('');

  const handleCreate = () => {
    if (!name || !targetAmount || !deadline) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      targetAmount: parseFloat(targetAmount.replace(',', '.')),
      currentAmount: parseFloat(initialAmount.replace(',', '.') || '0'),
      deadline,
      icon: 'Target'
    };

    onUpdate([...goals, newGoal]);
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    onUpdate(goals.filter(g => g.id !== id));
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    const newGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    onUpdate(newGoals);
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setDeadline('');
    setInitialAmount('');
  };

  const handleAddMoney = (goal: Goal) => {
    Alert.prompt(
      "Adicionar Valor",
      `Quanto você quer depositar em "${goal.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Depositar",
          onPress: (val) => {
            const amount = parseFloat(val?.replace(',', '.') || '0');
            if (amount > 0) {
              handleUpdateGoal({ ...goal, currentAmount: goal.currentAmount + amount });
            }
          }
        }
      ],
      "plain-text",
      "0,00"
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minhas Metas</Text>
          <Text style={styles.subtitle}>Acompanhe seus sonhos</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          style={styles.addButton}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = progress >= 100;

          return (
            <TouchableOpacity 
              key={goal.id} 
              onLongPress={() => Alert.alert("Excluir", "Deseja excluir esta meta?", [{text: "Cancelar"}, {text: "Excluir", onPress: () => handleDelete(goal.id)}])}
              style={styles.card}
            >
              {/* Barra de Progresso Fundo */}
              <View style={styles.progressBgAbs} />
              <View 
                style={[
                  styles.progressFillAbs, 
                  { 
                    width: `${progress}%`,
                    backgroundColor: isCompleted ? '#10b981' : '#3b82f6' 
                  }
                ]} 
              />

              <View style={styles.cardTop}>
                <View style={styles.cardIconRow}>
                  <View style={[styles.iconBox, { backgroundColor: isCompleted ? '#ecfdf5' : '#eff6ff' }]}>
                    {isCompleted ? <Trophy size={20} color="#10b981" /> : <Target size={20} color="#3b82f6" />}
                  </View>
                  <View>
                    <Text style={styles.cardName}>{goal.name}</Text>
                    <Text style={styles.cardDate}>{goal.deadline}</Text>
                  </View>
                </View>
                <View style={styles.alignEnd}>
                   <Text style={styles.missingLabel}>FALTAM</Text>
                   <Text style={styles.missingValue}>
                     R$ {Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                 <View>
                    <Text style={styles.progressLabel}>PROGRESSO</Text>
                    <View style={styles.progressRow}>
                      <Text style={[styles.progressPerc, { color: isCompleted ? '#059669' : '#2563eb' }]}>
                        {progress.toFixed(0)}%
                      </Text>
                      <Text style={styles.targetText}>
                        de R$ {goal.targetAmount.toLocaleString()}
                      </Text>
                    </View>
                 </View>

                 {!isCompleted && (
                   <TouchableOpacity 
                     onPress={() => handleAddMoney(goal)}
                     style={styles.depositButton}
                   >
                     <Plus size={14} color="white" />
                     <Text style={styles.depositText}>Depositar</Text>
                   </TouchableOpacity>
                 )}
              </View>
            </TouchableOpacity>
          );
        })}

        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Target size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma meta criada</Text>
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <Text style={styles.emptyLink}>Criar minha primeira meta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Nova Meta</Text>
               <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                 <X size={20} color="#64748b" />
               </TouchableOpacity>
             </View>

             <ScrollView contentContainerStyle={styles.formGap}>
                <View>
                   <Text style={styles.label}>Nome da Meta</Text>
                   <TextInput placeholder="Ex: Viagem" style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#94a3b8" />
                </View>

                <View style={styles.row}>
                  <View style={styles.flex1}>
                     <Text style={styles.label}>Valor Alvo (R$)</Text>
                     <TextInput placeholder="0,00" keyboardType="numeric" style={styles.input} value={targetAmount} onChangeText={setTargetAmount} placeholderTextColor="#94a3b8" />
                  </View>
                  <View style={styles.flex1}>
                     <Text style={styles.label}>Data Alvo</Text>
                     <TextInput placeholder="DD/MM/AAAA" style={styles.input} value={deadline} onChangeText={setDeadline} placeholderTextColor="#94a3b8" />
                  </View>
                </View>

                <View>
                   <Text style={styles.label}>Já guardou algo? (Opcional)</Text>
                   <TextInput placeholder="0,00" keyboardType="numeric" style={styles.input} value={initialAmount} onChangeText={setInitialAmount} placeholderTextColor="#94a3b8" />
                </View>

                <TouchableOpacity onPress={handleCreate} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Criar Meta</Text>
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
  list: { paddingBottom: 100, paddingHorizontal: 16, gap: 16 },
  
  // Card
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', position: 'relative', overflow: 'hidden', elevation: 2 },
  progressBgAbs: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: '#f1f5f9' },
  progressFillAbs: { position: 'absolute', bottom: 0, left: 0, height: 6 },
  
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { padding: 12, borderRadius: 16 },
  cardName: { fontWeight: 'bold', fontSize: 18, color: '#1e293b' },
  cardDate: { fontSize: 12, color: '#64748b' },
  alignEnd: { alignItems: 'flex-end' },
  missingLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8' },
  missingValue: { fontWeight: 'bold', color: '#1e293b', fontSize: 16 },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  progressLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  progressPerc: { fontSize: 20, fontWeight: 'bold' },
  targetText: { fontSize: 12, color: '#64748b' },
  
  depositButton: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  depositText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: '#f8fafc', borderRadius: 24, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16, fontWeight: '500' },
  emptyLink: { color: '#10b981', fontWeight: 'bold', marginTop: 8 },

  // Modal
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

export default GoalsManager;