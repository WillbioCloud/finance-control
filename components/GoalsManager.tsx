import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Goal } from '../types';
import { Target, Plus, Trophy, Calendar, DollarSign, X, TrendingUp } from 'lucide-react-native';

interface Props {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

const GoalsManager: React.FC<Props> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Estados do Formulário
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
    };

    onAddGoal(newGoal);
    setShowModal(false);
    resetForm();
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
              onUpdateGoal({ ...goal, currentAmount: goal.currentAmount + amount });
            }
          }
        }
      ],
      "plain-text",
      "0,00" // Placeholder
    );
  };

  return (
    <View className="pb-24">
      {/* Cabeçalho */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-xl font-bold text-slate-800">Minhas Metas</Text>
          <Text className="text-slate-400 text-xs">Acompanhe seus sonhos</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          className="bg-emerald-500 p-3 rounded-full shadow-sm"
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Lista de Metas */}
      <View className="gap-4">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = progress >= 100;

          return (
            <TouchableOpacity 
              key={goal.id} 
              onLongPress={() => Alert.alert("Excluir", "Deseja excluir esta meta?", [{text: "Cancelar"}, {text: "Excluir", onPress: () => onDeleteGoal(goal.id)}])}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden"
            >
              {/* Barra de Progresso de Fundo */}
              <View className="absolute bottom-0 left-0 h-1.5 bg-slate-100 w-full" />
              <View 
                className={`absolute bottom-0 left-0 h-1.5 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                style={{ width: `${progress}%` }} 
              />

              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-3">
                  <View className={`p-3 rounded-2xl ${isCompleted ? 'bg-emerald-100' : 'bg-blue-50'}`}>
                    {isCompleted ? <Trophy size={20} color="#10b981" /> : <Target size={20} color="#3b82f6" />}
                  </View>
                  <View>
                    <Text className="font-bold text-slate-800 text-lg">{goal.name}</Text>
                    <Text className="text-xs text-slate-400 font-medium">{goal.deadline}</Text>
                  </View>
                </View>
                <View className="items-end">
                   <Text className="text-xs font-bold text-slate-400 uppercase">Faltam</Text>
                   <Text className="font-bold text-slate-800">
                     R$ {Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-end">
                 <View>
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Progresso</Text>
                    <View className="flex-row items-baseline gap-1">
                      <Text className={`text-2xl font-bold ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {progress.toFixed(0)}%
                      </Text>
                      <Text className="text-slate-400 text-xs font-medium">
                        de R$ {goal.targetAmount.toLocaleString()}
                      </Text>
                    </View>
                 </View>

                 {!isCompleted && (
                   <TouchableOpacity 
                     onPress={() => handleAddMoney(goal)}
                     className="bg-slate-900 px-4 py-2 rounded-xl flex-row items-center gap-2"
                   >
                     <Plus size={14} color="white" />
                     <Text className="text-white text-xs font-bold">Depositar</Text>
                   </TouchableOpacity>
                 )}
              </View>
            </TouchableOpacity>
          );
        })}

        {goals.length === 0 && (
          <View className="items-center justify-center py-10 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <Target size={48} color="#cbd5e1" />
            <Text className="text-slate-400 font-medium mt-4">Nenhuma meta criada</Text>
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <Text className="text-emerald-500 font-bold mt-2">Criar minha primeira meta</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal Criar Meta */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[2.5rem] p-6 h-[85%]">
             
             <View className="flex-row justify-between items-center mb-8">
               <Text className="text-xl font-bold text-slate-800">Nova Meta</Text>
               <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full">
                 <X size={20} color="#64748b" />
               </TouchableOpacity>
             </View>

             <ScrollView className="space-y-6">
                <View>
                   <Text className="label-text">Nome da Meta</Text>
                   <TextInput 
                     placeholder="Ex: Viagem para Praia" 
                     className="input-field" 
                     value={name} onChangeText={setName} 
                   />
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                     <Text className="label-text">Valor Alvo (R$)</Text>
                     <TextInput 
                       placeholder="0,00" 
                       keyboardType="numeric" 
                       className="input-field"
                       value={targetAmount} onChangeText={setTargetAmount}
                     />
                  </View>
                  <View className="flex-1">
                     <Text className="label-text">Data Alvo</Text>
                     <TextInput 
                       placeholder="DD/MM/AAAA" 
                       className="input-field"
                       value={deadline} onChangeText={setDeadline}
                     />
                  </View>
                </View>

                <View>
                   <Text className="label-text">Já guardou algo? (Opcional)</Text>
                   <TextInput 
                     placeholder="0,00" 
                     keyboardType="numeric" 
                     className="input-field"
                     value={initialAmount} onChangeText={setInitialAmount}
                   />
                </View>

                <TouchableOpacity onPress={handleCreate} className="bg-emerald-500 py-4 rounded-2xl items-center mt-4 shadow-lg shadow-emerald-500/30">
                  <Text className="text-white font-bold text-lg">Criar Meta</Text>
                </TouchableOpacity>
             </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos auxiliares para NativeWind
const styles = {
  label: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1",
  input: "bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-800 font-bold"
};

export default GoalsManager;