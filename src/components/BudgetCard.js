import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/formatters';

const BudgetCard = ({ budget }) => {
  // Determine color based on percentage spent
  const getProgressColor = () => {
    if (budget.percentage >= 90) return '#EF4444'; // Red for danger
    if (budget.percentage >= 75) return '#F59E0B'; // Amber for warning
    return '#10B981'; // Emerald for good
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.categoryName}>{budget.category_name}</Text>
        <Text style={styles.amountText}>
          {formatCurrency(budget.spent)} / {formatCurrency(parseFloat(budget.monthly_limit))}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${budget.percentage}%`,
              backgroundColor: getProgressColor() 
            }
          ]} 
        />
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.percentageText}>{Math.round(budget.percentage)}% used</Text>
        <Text style={styles.remainingText}>
          {formatCurrency(budget.remaining)} remaining
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  percentageText: {
    fontSize: 14,
    color: '#64748B',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
});

export default BudgetCard;
