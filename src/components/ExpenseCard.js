import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDate } from '../utils/formatters';

const ExpenseCard = ({ expense, onPress }) => {
  const getCategoryIcon = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'food':
        return 'fast-food-outline';
      case 'transport':
        return 'car-outline';
      case 'entertainment':
        return 'film-outline';
      case 'shopping':
        return 'cart-outline';
      case 'bills':
        return 'receipt-outline';
      case 'health':
        return 'medkit-outline';
      default:
        return 'pricetag-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(expense)}>
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getCategoryIcon(expense.category_name)} 
            size={20} 
            color="#FFFFFF" 
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description}
          </Text>
          <Text style={styles.info}>
            {expense.category_name} • {formatDate(expense.date)}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>{formatCurrency(parseFloat(expense.amount))}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#64748B',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default ExpenseCard;
