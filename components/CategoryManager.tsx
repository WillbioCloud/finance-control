import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { TransactionType, Category } from '../types';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Tag, 
  Utensils, 
  Car, 
  Coffee, 
  ShoppingBag, 
  Heart, 
  Home, 
  Zap, 
  Wallet, 
  TrendingUp, 
  Smartphone, 
  Plane, 
  AlertCircle,
  Check
} from 'lucide-react-native';

interface Props {
  categories: Category[];
  onUpdate: (cats: Category[]) => void;
  onBack: () => void;
}

// Mapa de ícones disponíveis
const ICON_MAP: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={20} color="#fff" />,
  Car: <Car size={20} color="#fff" />,
  Coffee: <Coffee size={20} color="#fff" />,
  ShoppingBag: <ShoppingBag size={20} color="#fff" />,
  Heart: <Heart size={20} color="#fff" />,
  Home: <Home size={20} color="#fff" />,
  Zap: <Zap size={20} color="#fff" />,
  Wallet: <Wallet size={20} color="#fff" />,
  TrendingUp: <TrendingUp size={20} color="#fff" />,
  Smartphone: <Smartphone size={20} color="#fff" />,
  Plane: <Plane size={20} color="#fff" />,
  AlertCircle: <AlertCircle size={20} color="#fff" />,
  Tag: <Tag size={20} color="#fff" />
};

// Cores para as categorias (Tailwind convertidas)
const COLORS = [
  '#f97316', // orange-500
  '#3b82f6', // blue-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#ef4444', // red-500
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#f43f5e'  // rose-500
];

const CategoryManager: React.FC<Props> = ({ categories, onUpdate, onBack }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [newIcon, setNewIcon] = useState('Tag');

  const addCategory = () => {
    if (!newName.trim()) {
      Alert.alert("Nome Inválido", "Digite um nome para a categoria.");
      return;
    }
    
    // Escolhe cor aleatória
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    const newCat: Category = {
      id: Date.now().toString(),
      name: newName,
      type: newType,
      iconName: newIcon,
      color: color // Guarda a cor Hex
    };
    
    onUpdate([...categories, newCat]);
    setNewName('');
    setShowAdd(false);
  };

  const confirmRemove = (id: string) => {
    Alert.alert(
      "Remover Categoria",
      "Tem certeza? As transações antigas manterão o nome desta categoria.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removeCategory(id) }
      ]
    );
  };

  const removeCategory = (id: string) => {
    onUpdate(categories.filter(c => c.id !== id));
  };

  // Renderiza um item da lista
  const renderItem = (cat: Category) => (
    <View key={cat.id} style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: cat.color || '#94a3b8' }]}>
          {ICON_MAP[cat.iconName] || <Tag size={20} color="#fff" />}
        </View>
        <Text style={styles.itemName}>{cat.name}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmRemove(cat.id)} style={styles.deleteButton}>
        <Trash2 size={18} color="#cbd5e1" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#475569" />
        </TouchableOpacity>
        <Text style={styles.title}>Gerenciar Categorias</Text>
      </View>

      {!showAdd ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity 
            onPress={() => setShowAdd(true)}
            style={styles.addButton}
          >
            <Plus size={20} color="#94a3b8" />
            <Text style={styles.addButtonText}>Nova Categoria</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GANHOS</Text>
            <View style={styles.list}>
              {categories.filter(c => c.type === TransactionType.INCOME).map(renderItem)}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GASTOS</Text>
            <View style={styles.list}>
              {categories.filter(c => c.type === TransactionType.EXPENSE).map(renderItem)}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Seletor de Tipo */}
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                onPress={() => setNewType(TransactionType.EXPENSE)}
                style={[
                  styles.typeButton, 
                  newType === TransactionType.EXPENSE ? styles.activeTypeExpense : null
                ]}
              >
                <Text style={[
                  styles.typeText, 
                  newType === TransactionType.EXPENSE ? styles.activeTypeText : null
                ]}>Gasto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setNewType(TransactionType.INCOME)}
                style={[
                  styles.typeButton, 
                  newType === TransactionType.INCOME ? styles.activeTypeIncome : null
                ]}
              >
                <Text style={[
                  styles.typeText, 
                  newType === TransactionType.INCOME ? styles.activeTypeText : null
                ]}>Ganho</Text>
              </TouchableOpacity>
            </View>

            {/* Input Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOME DA CATEGORIA</Text>
              <TextInput 
                placeholder="Ex: Assinaturas"
                value={newName}
                onChangeText={setNewName}
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Seleção de Ícone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SELECIONE UM ÍCONE</Text>
              <View style={styles.iconGrid}>
                {Object.keys(ICON_MAP).map(iconName => {
                  const isActive = newIcon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      onPress={() => setNewIcon(iconName)}
                      style={[
                        styles.iconOption,
                        isActive ? styles.activeIconOption : null
                      ]}
                    >
                      {/* Clone o ícone para mudar a cor se necessário, ou use container */}
                      <View style={{ opacity: isActive ? 1 : 0.3 }}>
                         {/* Renderiza o ícone original que definimos com cor branca */}
                         {/* Para ficar cinza quando inativo, usamos opacidade no container pai */}
                         {React.cloneElement(ICON_MAP[iconName] as React.ReactElement, { 
                           color: isActive ? '#fff' : '#64748b' 
                         })}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Botões */}
            <View style={styles.footerButtons}>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addCategory} style={styles.saveButton}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  addButton: {
    width: '100%',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#94a3b8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  list: {
    gap: 12,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  deleteButton: {
    padding: 8,
  },
  
  // FORMULÁRIO DE ADIÇÃO
  formContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  typeText: {
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  activeTypeExpense: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTypeIncome: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTypeText: {
    color: '#1e293b',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeIconOption: {
    backgroundColor: '#10b981', // emerald-500
    borderColor: '#10b981',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default CategoryManager;