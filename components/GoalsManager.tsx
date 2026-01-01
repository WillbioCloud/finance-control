import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { Goal, Transaction, Category, TransactionType } from '../types';
import { Target, Plus, Trophy, X, Trash2, Sparkles, BrainCircuit, CheckCircle2, Circle, ArrowRight, Calendar } from 'lucide-react-native';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Props {
  goals: Goal[];
  transactions: Transaction[];
  categories: Category[];
  onUpdate: (goals: Goal[]) => void;
}

// Interface para a Proposta da IA
interface AIProposal {
  suggestedDate: string;
  suggestedAllocation: number;
  reasoning: string;
  isAchievable: boolean;
}

const GoalsManager: React.FC<Props> = ({ goals, transactions, categories, onUpdate }) => {
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // Estados de Edição/Ação
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositValue, setDepositValue] = useState('');

  // Estados Form Criar
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [monthlyAllocation, setMonthlyAllocation] = useState(''); // NOVO

  // --- ESTADOS DO WIZARD DA IA ---
  const [wizardStep, setWizardStep] = useState(1); // 1: Selecionar Meta, 2: Selecionar Obrigatórios, 3: Resultado
  const [mandatoryIds, setMandatoryIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProposal, setAiProposal] = useState<AIProposal | null>(null);

  // ==============================
  // LÓGICA DO WIZARD IA
  // ==============================

  const startAIAnalysis = () => {
    setWizardStep(1);
    setAiProposal(null);
    setMandatoryIds(new Set());
    setShowAIModal(true);
  };

  const toggleMandatory = (id: string) => {
    const newSet = new Set(mandatoryIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setMandatoryIds(newSet);
  };

  const processAnalysis = async () => {
    if (!selectedGoal) return;
    setWizardStep(3);
    setIsAnalyzing(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key não configurada");

      // 1. Calcular Finanças
      const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
      
      // Separa gastos obrigatórios dos variáveis
      let mandatoryTotal = 0;
      let variableTotal = 0;
      
      transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
        if (mandatoryIds.has(t.id)) {
          mandatoryTotal += t.amount;
        } else {
          variableTotal += t.amount;
        }
      });

      const freeBalance = income - mandatoryTotal;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `
        Atue como um planejador financeiro rigoroso.
        
        DADOS DA META:
        - Nome: ${selectedGoal.name}
        - Valor Alvo: R$ ${selectedGoal.targetAmount}
        - Valor Atual: R$ ${selectedGoal.currentAmount}
        - Prazo Atual: ${selectedGoal.deadline || 'Não definido'}
        - Alocação Mensal Planejada: R$ ${selectedGoal.monthlyAllocation || 0}

        DADOS FINANCEIROS MENSAIS:
        - Renda Total: R$ ${income}
        - Gastos Obrigatórios (fixos): R$ ${mandatoryTotal}
        - Gastos Variáveis (possíveis cortes): R$ ${variableTotal}
        - Saldo Real (Renda - Obrigatórios): R$ ${freeBalance}

        TAREFAS:
        1. Verifique se a "Alocação Mensal Planejada" é viável dentro do "Saldo Real".
        2. Calcule se é possível atingir o "Valor Alvo" no "Prazo Atual" com a alocação possível.
        3. Se não for possível, sugira um NOVO PRAZO (data futura DD/MM/AAAA) e uma NOVA ALOCAÇÃO mensal ideal.
        
        Retorne APENAS um JSON (sem markdown):
        {
          "suggestedDate": "DD/MM/AAAA",
          "suggestedAllocation": 0.00,
          "isAchievable": boolean,
          "reasoning": "Texto curto explicando a análise e sugerindo onde cortar gastos variáveis se necessário."
        }
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      
      setAiProposal(parsed);

    } catch (error) {
      Alert.alert("Erro", "Falha na análise da IA.");
      setShowAIModal(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAIChanges = () => {
    if (!selectedGoal || !aiProposal) return;

    const updatedGoals = goals.map(g => 
      g.id === selectedGoal.id 
        ? { 
            ...g, 
            deadline: aiProposal.suggestedDate, 
            monthlyAllocation: aiProposal.suggestedAllocation 
          } 
        : g
    );

    onUpdate(updatedGoals);
    setShowAIModal(false);
    Alert.alert("Sucesso", "Meta atualizada com o plano da IA!");
  };

  // ==============================
  // CRUD PADRÃO
  // ==============================
  const handleCreate = () => {
    if (!name || !targetAmount) {
      Alert.alert("Erro", "Preencha nome e valor alvo.");
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      targetAmount: parseFloat(targetAmount.replace(',', '.')),
      currentAmount: parseFloat(initialAmount.replace(',', '.') || '0'),
      deadline,
      monthlyAllocation: parseFloat(monthlyAllocation.replace(',', '.') || '0'),
      icon: 'Target'
    };

    onUpdate([...goals, newGoal]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    onUpdate(goals.filter(g => g.id !== id));
  };

  const openDepositModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setDepositValue('');
    setShowDepositModal(true);
  };

  const confirmDeposit = () => {
    if (!selectedGoal || !depositValue) return;
    const amount = parseFloat(depositValue.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const updatedGoals = goals.map(g => 
      g.id === selectedGoal.id 
        ? { ...g, currentAmount: g.currentAmount + amount } 
        : g
    );

    onUpdate(updatedGoals);
    setShowDepositModal(false);
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setDeadline('');
    setInitialAmount('');
    setMonthlyAllocation('');
  };

  // ==============================
  // RENDERIZAÇÃO
  // ==============================
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Minhas Metas</Text>
          <Text style={styles.subtitle}>Planejamento Inteligente</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={startAIAnalysis} style={styles.aiButton}>
            <Sparkles size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addButton}>
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {goals.map(goal => {
          const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
          const isCompleted = progress >= 100;

          return (
            <View key={goal.id} style={styles.card}>
              <View style={styles.progressBgAbs} />
              <View style={[styles.progressFillAbs, { width: `${progress}%`, backgroundColor: isCompleted ? '#10b981' : '#3b82f6' }]} />

              <View style={styles.cardTop}>
                <View style={styles.cardIconRow}>
                  <View style={[styles.iconBox, { backgroundColor: isCompleted ? '#ecfdf5' : '#eff6ff' }]}>
                    {isCompleted ? <Trophy size={20} color="#10b981" /> : <Target size={20} color="#3b82f6" />}
                  </View>
                  <View>
                    <Text style={styles.cardName}>{goal.name}</Text>
                    <View style={styles.dateRow}>
                       <Calendar size={12} color="#94a3b8" />
                       <Text style={styles.cardDate}>{goal.deadline || 'Sem prazo'}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => Alert.alert("Excluir", "Remover meta?", [{text: "Não"}, {text: "Sim", onPress: () => handleDelete(goal.id)}])}>
                   <Trash2 size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardValues}>
                 <View>
                   <Text style={styles.missingLabel}>ALOCAÇÃO MENSAL</Text>
                   <Text style={styles.allocationValue}>
                     {goal.monthlyAllocation ? `R$ ${goal.monthlyAllocation.toLocaleString()}` : 'Não definida'}
                   </Text>
                 </View>
                 <View style={styles.alignEnd}>
                   <Text style={styles.missingLabel}>FALTAM</Text>
                   <Text style={styles.missingValue}>
                     R$ {Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                 <View style={styles.progressRow}>
                    <Text style={[styles.progressPerc, { color: isCompleted ? '#059669' : '#2563eb' }]}>
                      {progress.toFixed(0)}%
                    </Text>
                    <Text style={styles.targetText}>de R$ {goal.targetAmount.toLocaleString()}</Text>
                 </View>

                 {!isCompleted && (
                   <TouchableOpacity onPress={() => openDepositModal(goal)} style={styles.depositButton}>
                     <Plus size={14} color="white" />
                     <Text style={styles.depositText}>Depositar</Text>
                   </TouchableOpacity>
                 )}
              </View>
            </View>
          );
        })}
        
        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Target size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma meta criada</Text>
          </View>
        )}
      </ScrollView>

      {/* --- MODAL WIZARD IA --- */}
      <Modal visible={showAIModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.aiModalContent}>
             
             {/* Header do Modal */}
             <View style={styles.aiHeader}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                 <BrainCircuit size={24} color="#8b5cf6" />
                 <Text style={styles.aiTitle}>Planejador IA</Text>
               </View>
               <TouchableOpacity onPress={() => setShowAIModal(false)} style={styles.closeButton}>
                 <X size={20} color="#64748b" />
               </TouchableOpacity>
             </View>

             {/* STEP 1: Selecionar Meta */}
             {wizardStep === 1 && (
               <View style={styles.wizardStep}>
                 <Text style={styles.wizardTitle}>1. Qual meta vamos analisar?</Text>
                 <Text style={styles.wizardSubtitle}>Escolha uma meta para criar um plano.</Text>
                 
                 <ScrollView style={styles.wizardScroll}>
                   {goals.map(g => (
                     <TouchableOpacity 
                        key={g.id} 
                        onPress={() => { setSelectedGoal(g); setWizardStep(2); }}
                        style={styles.wizardOption}
                     >
                       <Text style={styles.optionText}>{g.name}</Text>
                       <ArrowRight size={16} color="#cbd5e1" />
                     </TouchableOpacity>
                   ))}
                 </ScrollView>
               </View>
             )}

             {/* STEP 2: Selecionar Obrigatórios */}
             {wizardStep === 2 && (
               <View style={styles.wizardStep}>
                 <Text style={styles.wizardTitle}>2. O que é obrigatório?</Text>
                 <Text style={styles.wizardSubtitle}>Marque as despesas que NÃO podem ser cortadas este mês.</Text>
                 
                 <ScrollView style={styles.wizardScroll}>
                   {transactions.filter(t => t.type === TransactionType.EXPENSE).map(t => {
                     const isSelected = mandatoryIds.has(t.id);
                     return (
                       <TouchableOpacity 
                          key={t.id} 
                          onPress={() => toggleMandatory(t.id)}
                          style={[styles.checkOption, isSelected && styles.checkOptionActive]}
                       >
                         <View style={{flex: 1}}>
                           <Text style={[styles.checkText, isSelected && {color: '#1e293b'}]}>{t.description}</Text>
                           <Text style={styles.checkSubText}>R$ {t.amount.toFixed(2)}</Text>
                         </View>
                         {isSelected ? <CheckCircle2 size={24} color="#10b981" /> : <Circle size={24} color="#cbd5e1" />}
                       </TouchableOpacity>
                     );
                   })}
                 </ScrollView>
                 
                 <TouchableOpacity onPress={processAnalysis} style={styles.nextButton}>
                   <Text style={styles.nextButtonText}>Analisar com IA</Text>
                   <Sparkles size={18} color="#fff" />
                 </TouchableOpacity>
               </View>
             )}

             {/* STEP 3: Resultado e Autorização */}
             {wizardStep === 3 && (
               <View style={styles.wizardStep}>
                 {isAnalyzing ? (
                   <View style={styles.loadingContainer}>
                     <ActivityIndicator size="large" color="#8b5cf6" />
                     <Text style={styles.loadingText}>Calculando viabilidade...</Text>
                   </View>
                 ) : aiProposal ? (
                   <ScrollView>
                     <Text style={styles.resultTitle}>Plano Gerado</Text>
                     <Text style={styles.resultReason}>{aiProposal.reasoning}</Text>
                     
                     <View style={styles.proposalCard}>
                       <View style={styles.proposalRow}>
                         <Text style={styles.proposalLabel}>Nova Data Sugerida:</Text>
                         <Text style={styles.proposalValue}>{aiProposal.suggestedDate}</Text>
                       </View>
                       <View style={styles.proposalRow}>
                         <Text style={styles.proposalLabel}>Alocação Mensal:</Text>
                         <Text style={styles.proposalValue}>R$ {aiProposal.suggestedAllocation.toFixed(2)}</Text>
                       </View>
                     </View>

                     <Text style={styles.authText}>Você autoriza a alteração da meta para estes novos parâmetros?</Text>

                     <TouchableOpacity onPress={applyAIChanges} style={styles.authButton}>
                       <Text style={styles.authButtonText}>Autorizar e Atualizar</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity onPress={() => setShowAIModal(false)} style={styles.secondaryButton}>
                       <Text style={styles.secondaryButtonText}>Manter como está</Text>
                     </TouchableOpacity>
                   </ScrollView>
                 ) : null}
               </View>
             )}

          </View>
        </View>
      </Modal>

      {/* MODAL CRIAR */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Nova Meta</Text>
               <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeButton}>
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
                   <Text style={styles.label}>Alocação Mensal (Planejado)</Text>
                   <TextInput placeholder="Quanto guardar p/ mês?" keyboardType="numeric" style={styles.input} value={monthlyAllocation} onChangeText={setMonthlyAllocation} placeholderTextColor="#94a3b8" />
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

      {/* MODAL DEPOSITAR */}
      <Modal visible={showDepositModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: 'auto', paddingBottom: 32 }]}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Adicionar Valor</Text>
               <TouchableOpacity onPress={() => setShowDepositModal(false)} style={styles.closeButton}>
                 <X size={20} color="#64748b" />
               </TouchableOpacity>
             </View>
             <Text style={styles.depositSubtitle}>Quanto quer depositar em "{selectedGoal?.name}"?</Text>
             <TextInput placeholder="0,00" keyboardType="numeric" style={styles.depositInput} value={depositValue} onChangeText={setDepositValue} placeholderTextColor="#cbd5e1" autoFocus />
             <TouchableOpacity onPress={confirmDeposit} style={styles.saveButton}>
               <Text style={styles.saveButtonText}>Confirmar</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 16, marginTop: 16 },
  headerActions: { flexDirection: 'row', gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { color: '#64748b', fontSize: 14 },
  addButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 24, elevation: 2 },
  aiButton: { backgroundColor: '#8b5cf6', padding: 12, borderRadius: 24, elevation: 2 },
  list: { paddingBottom: 100, paddingHorizontal: 16, gap: 16 },
  
  // Card
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', position: 'relative', overflow: 'hidden', elevation: 2 },
  progressBgAbs: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: '#f1f5f9' },
  progressFillAbs: { position: 'absolute', bottom: 0, left: 0, height: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { padding: 12, borderRadius: 16 },
  cardName: { fontWeight: 'bold', fontSize: 18, color: '#1e293b' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardDate: { fontSize: 12, color: '#64748b' },
  
  cardValues: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  allocationValue: { fontWeight: 'bold', fontSize: 14, color: '#3b82f6' },
  currentValue: { fontWeight: 'bold', fontSize: 16, color: '#10b981' },
  alignEnd: { alignItems: 'flex-end' },
  missingLabel: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8' },
  missingValue: { fontWeight: 'bold', color: '#64748b', fontSize: 16 },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  progressPerc: { fontSize: 20, fontWeight: 'bold' },
  targetText: { fontSize: 12, color: '#64748b' },
  depositButton: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  depositText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: '#f8fafc', borderRadius: 24, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16, fontWeight: '500' },
  emptyLink: { color: '#10b981', fontWeight: 'bold', marginTop: 8 },

  // Modal Comum
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, height: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  closeButton: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  formGap: { gap: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  row: { flexDirection: 'row', gap: 16 },
  flex1: { flex: 1 },
  saveButton: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 16, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  depositSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  depositInput: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#1e293b', borderBottomWidth: 2, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 16 },

  // --- STYLES DO WIZARD IA ---
  aiModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, height: '90%' },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 16 },
  aiTitle: { fontSize: 18, fontWeight: 'bold', color: '#8b5cf6' },
  
  wizardStep: { flex: 1 },
  wizardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  wizardSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  wizardScroll: { flex: 1 },
  
  wizardOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#f8fafc', marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  optionText: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  
  checkOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  checkOptionActive: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
  checkText: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  checkSubText: { fontSize: 12, color: '#94a3b8' },
  
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#8b5cf6', padding: 16, borderRadius: 16, marginTop: 16 },
  nextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  loadingContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 14 },
  
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#10b981', marginBottom: 12 },
  resultReason: { fontSize: 14, color: '#334155', lineHeight: 22, marginBottom: 24 },
  proposalCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24 },
  proposalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  proposalLabel: { fontSize: 14, color: '#64748b' },
  proposalValue: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  
  authText: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 16 },
  authButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  authButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: { padding: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#64748b', fontWeight: 'bold' }
});

export default GoalsManager;