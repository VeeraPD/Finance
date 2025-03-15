import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../contexts/ExpenseContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const BudgetScreen = () => {
  const { categories, budgets, addBudget, getBudgetStatus, refreshData, isLoading } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [monthlyLimit, setMonthlyLimit] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
    const status = getBudgetStatus();
    setBudgetStatus(status);
  }, [categories, budgets, selectedCategoryId, getBudgetStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    const status = getBudgetStatus();
    setBudgetStatus(status);
    setRefreshing(false);
  };

  const handleAddBudget = async () => {
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!monthlyLimit || isNaN(parseFloat(monthlyLimit)) || parseFloat(monthlyLimit) <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly limit');
      return;
    }
    const existingBudget = budgets.find(b => b.category_id === selectedCategoryId);
    if (existingBudget) {
      Alert.alert('Error', 'A budget already exists for this category');
      return;
    }
    const budgetData = {
      category_id: selectedCategoryId,
      monthly_limit: parseFloat(monthlyLimit),
      start_date: new Date().toISOString().split('T')[0]
    };
    const success = await addBudget(budgetData);
    if (success) {
      Alert.alert('Success', 'Budget added successfully');
      setMonthlyLimit('');
      setShowAddModal(false);
    }
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'danger':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const renderBudgetItem = ({ item }) => (
    <View style={styles.budgetItem}>
      <View style={styles.budgetHeader}>
        <Text style={styles.categoryName}>{item.category_name}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'danger' ? 'Over Budget' : item.status === 'warning' ? 'Warning' : 'On Track'}
          </Text>
        </View>
      </View>
      <View style={styles.budgetDetails}>
        <Text style={styles.budgetAmount}>
          <Text style={styles.spentAmount}>{formatAmount(item.spent)}</Text> / {formatAmount(item.monthly_limit)}
        </Text>
        <Text style={styles.remainingText}>
          {item.remaining > 0 ? `${formatAmount(item.remaining)} remaining` : 'Limit exceeded'}
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${item.percentage}%`, backgroundColor: getStatusColor(item.status) }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : budgetStatus.length > 0 ? (
        <FlatList
          data={budgetStatus}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>No budgets set yet</Text>
          <Text style={styles.emptySubtext}>Set monthly budgets for your expense categories to track your spending better</Text>
          <TouchableOpacity style={styles.emptyAddButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.emptyAddButtonText}>Add Your First Budget</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal visible={showAddModal} transparent={true} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Budget</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCategoryId}
                    onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
                    style={styles.picker}
                  >
                    {categories.map((category) => (
                      <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monthly Limit</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={monthlyLimit}
                    onChangeText={setMonthlyLimit}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#A1A1AA"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddBudget}>
                <Text style={styles.submitButtonText}>Add Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (existing styles remain unchanged)
});

export default BudgetScreen;
