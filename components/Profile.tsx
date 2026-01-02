import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Modal, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { UserProfile } from '../types';
import { 
  Settings, 
  LogOut, 
  ChevronRight, 
  Tag, 
  CreditCard, 
  Target, 
  User, 
  Edit2, 
  Camera, 
  RefreshCcw, 
  X, 
  Check 
} from 'lucide-react-native';
import { supabase } from '../utils/supabase';
import { FinanceService } from '../services/financeService';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onNavigate: (screen: string) => void;
}

const Profile: React.FC<Props> = ({ profile, onUpdateProfile, onNavigate }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de Edição
  const [editName, setEditName] = useState(profile.name);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  // Função para abrir o modal com os dados atuais
  const openEditModal = () => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar);
    setShowEditModal(true);
  };

  // Função para gerar avatar aleatório
  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${randomSeed}&backgroundColor=b6e3f4`;
    setEditAvatar(newUrl);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Erro", "O nome não pode ficar vazio.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile: UserProfile = {
        ...profile,
        name: editName,
        avatar: editAvatar
      };

      // 1. Salva no Supabase
      await FinanceService.updateProfile(updatedProfile);

      // 2. Atualiza o estado local do App
      onUpdateProfile(updatedProfile);

      setShowEditModal(false);
      Alert.alert("Sucesso", "Perfil atualizado!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o perfil.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: async () => {
            await supabase.auth.signOut();
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: Tag, label: 'Categorias', screen: 'categories', color: '#3b82f6' },
    { icon: CreditCard, label: 'Cartões', screen: 'cards', color: '#8b5cf6' },
    { icon: Target, label: 'Metas', screen: 'goals', color: '#f59e0b' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={openEditModal} style={styles.headerEditButton}>
          <Edit2 size={20} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Card do Usuário */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: profile.avatar || 'https://github.com/shadcn.png' }} 
            style={styles.avatar} 
          />
          <TouchableOpacity onPress={openEditModal} style={styles.editAvatarButton}>
            <Camera size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profile.name || 'Usuário'}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Membro desde {profile.memberSince || '2024'}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuItem, index !== menuItems.length - 1 && styles.borderBottom]}
              onPress={() => onNavigate(item.screen)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeButton}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
              
              {/* Edição de Avatar */}
              <View style={styles.editAvatarSection}>
                <Image source={{ uri: editAvatar }} style={styles.previewAvatar} />
                
                <View style={styles.avatarActions}>
                  <TouchableOpacity onPress={generateRandomAvatar} style={styles.refreshButton}>
                    <RefreshCcw size={16} color="#fff" />
                    <Text style={styles.refreshText}>Gerar Novo</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.orText}>ou cole uma URL abaixo</Text>
                </View>
              </View>

              {/* Inputs */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Link da Foto (URL)</Text>
                <TextInput 
                  value={editAvatar}
                  onChangeText={setEditAvatar}
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor="#cbd5e1"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome de Exibição</Text>
                <TextInput 
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.input}
                  placeholder="Seu nome"
                  placeholderTextColor="#cbd5e1"
                />
              </View>

              <TouchableOpacity 
                onPress={handleSaveProfile} 
                disabled={isSaving}
                style={styles.saveButton}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Check size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                  </>
                )}
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  headerEditButton: { padding: 8, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  
  profileCard: { alignItems: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', borderWidth: 3, borderColor: '#fff' },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 },
  email: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  badge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, color: '#475569', fontWeight: '600' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12, marginLeft: 4 },
  menuContainer: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 16, fontWeight: '500', color: '#334155' },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginBottom: 32 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },

  // Styles Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '80%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  closeButton: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  
  formContent: { gap: 24 },
  editAvatarSection: { alignItems: 'center', gap: 16, marginBottom: 8 },
  previewAvatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f1f5f9', borderWidth: 4, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  avatarActions: { alignItems: 'center', gap: 8 },
  refreshButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#3b82f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  refreshText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  orText: { fontSize: 12, color: '#94a3b8' },

  inputGroup: { gap: 8 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginLeft: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', padding: 16, borderRadius: 16, fontSize: 16, color: '#1e293b' },
  
  saveButton: { backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default Profile;