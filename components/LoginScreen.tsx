import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import { supabase } from '../utils/supabase';
import { Mail, Lock, ArrowRight, LogIn, User } from 'lucide-react-native';

interface Props {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // --- CADASTRO ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name, // Envia o nome para o Trigger do banco usar
            },
          },
        });

        if (error) throw error;

        Alert.alert(
          'Sucesso', 
          'Conta criada! Verifique se recebeu um e-mail de confirmação ou faça login.'
        );
        setIsSignUp(false);
        
      } else {
        // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        onLoginSuccess();
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <LogIn size={40} color="#10b981" />
          </View>
          <Text style={styles.title}>Finance Control</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Crie sua conta completa' : 'Gerencie suas finanças'}
          </Text>
        </View>

        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <User size={20} color="#94a3b8" />
              <TextInput 
                placeholder="Seu Nome"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#cbd5e1"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Mail size={20} color="#94a3b8" />
            <TextInput 
              placeholder="E-mail"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#cbd5e1"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#94a3b8" />
            <TextInput 
              placeholder="Senha"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#cbd5e1"
            />
          </View>

          <TouchableOpacity 
            onPress={handleAuth} 
            disabled={loading}
            style={styles.mainButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.mainButtonText}>
                  {isSignUp ? 'Cadastrar' : 'Entrar'}
                </Text>
                <ArrowRight size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isSignUp ? 'Já tem conta?' : 'Novo por aqui?'}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.linkText}>
              {isSignUp ? 'Fazer Login' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 80, height: 80, backgroundColor: '#ecfdf5', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#a7f3d0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b' },
  form: { gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, paddingHorizontal: 16, height: 56, gap: 12 },
  input: { flex: 1, fontSize: 16, color: '#334155' },
  mainButton: { backgroundColor: '#10b981', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  mainButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 32 },
  footerText: { color: '#64748b', fontSize: 14 },
  linkText: { color: '#10b981', fontWeight: 'bold', fontSize: 14 }
});

export default LoginScreen;