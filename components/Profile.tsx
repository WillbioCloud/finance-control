import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { UserProfile } from '../types';
import { Settings, LogOut, ChevronRight, Tag, CreditCard, Target, User } from 'lucide-react-native';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onNavigate: (screen: string) => void;
}

const Profile: React.FC<Props> = ({ profile, onUpdateProfile, onNavigate }) => {
  
  const menuItems = [
    { icon: Tag, label: 'Categorias', screen: 'categories', color: '#3b82f6' },
    { icon: CreditCard, label: 'Cartões', screen: 'cards', color: '#8b5cf6' },
    { icon: Target, label: 'Metas', screen: 'goals', color: '#f59e0b' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Meu Perfil</Text>

      {/* Card do Usuário */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Settings size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Membro desde {profile.memberSince}</Text>
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
      <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert("Sair", "Funcionalidade demo.")}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginVertical: 20 },
  
  profileCard: { alignItems: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9' },
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
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});

export default Profile;