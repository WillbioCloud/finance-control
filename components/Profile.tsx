import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { UserProfile } from '../types';
import { Settings, Bell, Shield, CircleHelp, LogOut, ChevronRight, User, Mail } from 'lucide-react-native';

interface Props {
  user: UserProfile;
}

const Profile: React.FC<Props> = ({ user }) => {
  return (
    <View className="pb-24">
      <Text className="text-xl font-bold text-slate-800 mb-6">Meu Perfil</Text>

      {/* Card do Usuário */}
      <View className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex-row items-center gap-4 mb-6">
        <Image 
          source={{ uri: user.avatar }} 
          className="w-20 h-20 rounded-full bg-slate-100"
        />
        <View>
          <Text className="text-xl font-bold text-slate-800">{user.name}</Text>
          <Text className="text-slate-400 text-sm mb-2">{user.email}</Text>
          <View className="bg-emerald-100 px-3 py-1 rounded-full self-start">
             <Text className="text-emerald-700 text-[10px] font-bold uppercase">Membro desde {user.memberSince}</Text>
          </View>
        </View>
      </View>

      {/* Seção de Configurações */}
      <View className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        
        <SettingItem icon={User} label="Dados Pessoais" />
        <SettingItem icon={Bell} label="Notificações" hasSwitch />
        <SettingItem icon={Shield} label="Segurança" />
        <SettingItem icon={CircleHelp} label="Ajuda e Suporte" />
        
        <View className="h-[1px] bg-slate-100 mx-6 my-2" />
        
        <TouchableOpacity 
          className="flex-row items-center gap-4 p-5 active:bg-slate-50"
          onPress={() => Alert.alert("Sair", "Deseja realmente sair do aplicativo?")}
        >
          <View className="w-10 h-10 rounded-2xl bg-rose-50 items-center justify-center">
            <LogOut size={20} color="#f43f5e" />
          </View>
          <Text className="flex-1 font-bold text-rose-500 text-base">Sair da Conta</Text>
        </TouchableOpacity>
      
      </View>

      <Text className="text-center text-slate-300 text-xs mt-8">Versão 1.0.0 • Finance Control</Text>
    </View>
  );
};

const SettingItem = ({ icon: Icon, label, hasSwitch }: any) => (
  <TouchableOpacity className="flex-row items-center gap-4 p-5 border-b border-slate-50 active:bg-slate-50">
    <View className="w-10 h-10 rounded-2xl bg-slate-50 items-center justify-center">
      <Icon size={20} color="#64748b" />
    </View>
    <Text className="flex-1 font-bold text-slate-700 text-base">{label}</Text>
    {hasSwitch ? (
      <Switch trackColor={{ false: "#e2e8f0", true: "#10b981" }} value={true} />
    ) : (
      <ChevronRight size={20} color="#cbd5e1" />
    )}
  </TouchableOpacity>
);

export default Profile;