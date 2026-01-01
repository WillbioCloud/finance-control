import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Transaction, Category, TransactionType } from '../types';
import { TrendingUp, TrendingDown, Trash2, ShoppingBag, ChevronUp, DollarSign } from 'lucide-react-native';

// --- SUBCOMPONENTE DO ITEM (Agora com expansão) ---
export const TransactionItem = ({ t, onDelete, cat }: { t: Transaction, onDelete: (id: string) => void, cat?: Category }) => {
  const [expanded, setExpanded] = useState(false);
  const isExpense = t.type === TransactionType.EXPENSE;
  const hasDetails = t.details && t.details.length > 0;
  
  const handleDelete = () => {
    Alert.alert(
      "Excluir",
      "Tem certeza que deseja apagar esta transação?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => onDelete(t.id) }
      ]
    );
  };

  const handlePress = () => {
    if (hasDetails) {
      setExpanded(!expanded);
    }
  };

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={hasDetails ? 0.7 : 1}
        style={styles.itemContainer}
      >
        <View style={styles.leftContent}>
          {/* Ícone */}
          <View style={[styles.iconContainer, { backgroundColor: cat?.color || '#e2e8f0' }]}>
            {isExpense ? <TrendingDown size={18} color="#fff" /> : <TrendingUp size={18} color="#fff" />}
          </View>
          
          {/* Textos */}
          <View style={styles.textContainer}>
            <Text style={styles.description} numberOfLines={1}>{t.description}</Text>
            
            <View style={styles.categoryRow}>
              <Text style={styles.category}>{cat?.name || t.category}</Text>
              
              {/* Badge indicando que tem detalhes */}
              {hasDetails && (
                <View style={styles.detailsBadge}>
                  <ShoppingBag size={10} color="#64748b" />
                  <Text style={styles.detailsBadgeText}>Ver itens</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.rightActions}>
          <View style={styles.rightContent}>
            <Text style={[styles.amount, { color: isExpense ? '#ef4444' : '#10b981' }]}>
              {isExpense ? '-' : '+'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.date}>{t.date.split('-').reverse().join('/')}</Text>
          </View>

          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* --- LISTA DE DETALHES (Expandível) --- */}
      {expanded && hasDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>ITENS DA COMPRA</Text>
            <TouchableOpacity onPress={() => setExpanded(false)}>
               <ChevronUp size={14} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          
          {t.details?.map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailItemText}>
                {item.quantity && item.quantity !== "1" ? <Text style={styles.qtyText}>{item.quantity}x </Text> : ''}
                {item.item}
              </Text>
              <Text style={styles.detailAmountText}>
                R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
}

const TransactionsList: React.FC<Props> = ({ transactions, categories, onDelete }) => {
  return (
    <View style={styles.listContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Extrato Completo</Text>
        <Text style={styles.subtitle}>{transactions.length} registros</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionItem 
            t={item} 
            onDelete={onDelete} 
            cat={categories.find(c => c.name === item.category)} 
          />
        )}
        contentContainerStyle={{ paddingBottom: 24, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <DollarSign size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: { flex: 1, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { color: '#64748b', fontSize: 14 },
  
  // Card Principal
  cardWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
    overflow: 'hidden', // Importante para o conteúdo expandido
  },
  itemContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  textContainer: { flex: 1 },
  description: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  category: { color: '#64748b', fontSize: 12 },
  detailsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  detailsBadgeText: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },

  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rightContent: { alignItems: 'flex-end' },
  amount: { fontWeight: 'bold', fontSize: 14 },
  date: { color: '#94a3b8', fontSize: 10, fontWeight: '600' },
  deleteButton: { padding: 4 },

  // Área de Detalhes
  detailsContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailsTitle: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  detailItemText: { fontSize: 13, color: '#334155', flex: 1 },
  qtyText: { fontWeight: 'bold', color: '#64748b' },
  detailAmountText: { fontSize: 13, fontWeight: '600', color: '#475569' },

  // Empty State
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
  emptyText: { color: '#94a3b8', fontSize: 16 }
});

export default TransactionsList;