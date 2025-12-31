import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { CreditCard } from '../types';
import { CreditCard as CardIcon, Plus, X, Trash2, Calendar, DollarSign } from 'lucide-react-native';

interface Props {
  cards: CreditCard[];
  onAddCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
}

const CardsManager: React.FC<Props> = ({ cards, onAddCard, onDeleteCard }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Estados do Formulário
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

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
      used: 0, // Começa com 0 de uso
      closingDay: parseInt(closingDay) || 1,
      dueDay: parseInt(dueDay),
      color: 'bg-slate-800' // Cor padrão, poderia ser dinâmica
    };

    onAddCard(newCard);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setBank('');
    setLimit('');
    setClosingDay('');
    setDueDay('');
  };

  return (
    <View className="pb-24">
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-xl font-bold text-slate-800">Meus Cartões</Text>
          <Text className="text-slate-400 text-xs">Gerencie seus limites</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          className="bg-emerald-500 p-3 rounded-full shadow-sm"
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View className="gap-6">
        {cards.map(card => {
          const usedPercent = Math.min((card.used / card.limit) * 100, 100);
          const available = card.limit - card.used;

          return (
            <View key={card.id} className="bg-white rounded-[2rem] p-1 shadow-sm border border-slate-100">
               {/* Visual do Cartão */}
               <View className={`h-48 rounded-[1.8rem] p-6 justify-between ${card.color || 'bg-slate-800'} relative overflow-hidden`}>
                  {/* Círculos decorativos de fundo */}
                  <View className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
                  <View className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/5" />

                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{card.bank}</Text>
                      <Text className="text-white text-xl font-bold">{card.name}</Text>
                    </View>
                    <CardIcon color="rgba(255,255,255,0.8)" size={32} />
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-2">
                       <Text className="text-white/80 text-xs">Vence dia {card.dueDay}</Text>
                       <Text className="text-white font-bold text-lg">R$ {card.used.toLocaleString()}</Text>
                    </View>
                    {/* Barra de Limite */}
                    <View className="h-1.5 bg-black/30 rounded-full overflow-hidden w-full">
                       <View className="h-full bg-white/90" style={{ width: `${usedPercent}%` }} />
                    </View>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-white/60 text-[10px]">Limite: R$ {card.limit.toLocaleString()}</Text>
                      <Text className="text-emerald-300 text-[10px] font-bold">Disponível: R$ {available.toLocaleString()}</Text>
                    </View>
                  </View>
               </View>

               {/* Ações do Cartão */}
               <View className="flex-row justify-end p-3">
                 <TouchableOpacity 
                    onPress={() => Alert.alert("Excluir", "Remover este cartão?", [{text: "Cancelar"}, {text: "Sim", onPress: () => onDeleteCard(card.id)}])}
                    className="flex-row items-center gap-2 px-3 py-2"
                 >
                    <Trash2 size={16} color="#ef4444" />
                    <Text className="text-red-500 text-xs font-bold">Remover</Text>
                 </TouchableOpacity>
               </View>
            </View>
          );
        })}

        {cards.length === 0 && (
          <View className="items-center justify-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <CardIcon size={48} color="#cbd5e1" />
            <Text className="text-slate-400 font-medium mt-4">Nenhum cartão cadastrado</Text>
          </View>
        )}
      </View>

      {/* Modal Adicionar Cartão */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[2.5rem] p-6 h-[85%]">
             <View className="flex-row justify-between items-center mb-8">
               <Text className="text-xl font-bold text-slate-800">Novo Cartão</Text>
               <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full">
                 <X size={20} color="#64748b" />
               </TouchableOpacity>
             </View>

             <ScrollView className="space-y-5">
                <View>
                   <Text className="label-text">Apelido do Cartão</Text>
                   <TextInput placeholder="Ex: Nubank Black" className="input-field" value={name} onChangeText={setName} />
                </View>
                <View>
                   <Text className="label-text">Banco Emissor</Text>
                   <TextInput placeholder="Ex: Nubank" className="input-field" value={bank} onChangeText={setBank} />
                </View>
                <View>
                   <Text className="label-text">Limite Total (R$)</Text>
                   <TextInput placeholder="0,00" keyboardType="numeric" className="input-field" value={limit} onChangeText={setLimit} />
                </View>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                     <Text className="label-text">Dia Fechamento</Text>
                     <TextInput placeholder="Dia" keyboardType="numeric" className="input-field" value={closingDay} onChangeText={setClosingDay} maxLength={2} />
                  </View>
                  <View className="flex-1">
                     <Text className="label-text">Dia Vencimento</Text>
                     <TextInput placeholder="Dia" keyboardType="numeric" className="input-field" value={dueDay} onChangeText={setDueDay} maxLength={2} />
                  </View>
                </View>

                <TouchableOpacity onPress={handleCreate} className="bg-emerald-500 py-4 rounded-2xl items-center mt-6 shadow-lg shadow-emerald-500/30">
                  <Text className="text-white font-bold text-lg">Adicionar Cartão</Text>
                </TouchableOpacity>
             </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  label: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1",
  input: "bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-800 font-bold"
};

export default CardsManager;