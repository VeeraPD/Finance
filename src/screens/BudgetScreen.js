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
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../contexts/ExpenseContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressCircle } from 'react-native-svg-charts';
// Theme imports
import { theme, layout, typography, forms } from '../styles';
import { getProgressColor } from '../styles/utils';
import { Button, Input } from '../components/ui';
import { formatCurrency } from '../utils/formatters';

const BudgetScreen = ({ navigation }) => {
  const { categories, budgets, expenses, addBudget, addCategory, getBudgetStatus, refreshData, isLoading } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showBudgetDetailModal, setShowBudgetDetailModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const screenWidth = Dimensions.get('window').width;

  // Get total budget and spending amounts for the summary
  const totalBudget = budgetStatus.reduce((sum, budget) => sum + parseFloat(budget.monthly_limit), 0);
  const totalSpent = budgetStatus.reduce((sum, budget) => sum + budget.spent, 0);
  const budgetedPercentage = Math.min(100, (totalSpent / totalBudget) * 100 || 0);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
    loadBudgetData();
  }, [categories, budgets, expenses]);

  const loadBudgetData = () => {
    const status = getBudgetStatus();
    setBudgetStatus(status);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    loadBudgetData();
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
    
    // Check if budget already exists for this category
    const existingBudget = budgetStatus.find(b => b.category_id === selectedCategoryId);
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
      loadBudgetData();
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    
    // Validate budget if provided
    let budgetLimit = null;
    if (newCategoryBudget.trim()) {
      const budgetValue = parseFloat(newCategoryBudget);
      if (isNaN(budgetValue) || budgetValue <= 0) {
        Alert.alert('Error', 'Please enter a valid budget amount');
        return;
      }
      budgetLimit = budgetValue;
    }
    
    // First add the category
    const categoryData = {
      name: newCategoryName.trim(),
      budget_limit: budgetLimit
    };
    
    const categorySuccess = await addCategory(categoryData);
    
    if (categorySuccess) {
      // If budget was specified, add budget for the new category
      if (budgetLimit) {
        // Get the newly created category
        await refreshData();
        const newCategory = categories.find(c => c.name === newCategoryName.trim());
        
        if (newCategory) {
          const budgetData = {
            category_id: newCategory.id,
            monthly_limit: budgetLimit,
            start_date: new Date().toISOString().split('T')[0]
          };
          
          await addBudget(budgetData);
        }
      }
      
      Alert.alert('Success', 'Category added successfully');
      setNewCategoryName('');
      setNewCategoryBudget('');
      setShowAddCategoryModal(false);
      await refreshData();
      loadBudgetData();
    }
  };

  const handleViewBudgetDetail = (budget) => {
    setSelectedBudget(budget);
    setShowBudgetDetailModal(true);
  };

  // Function to get top expense items for a specific budget
  const getBudgetTopExpenses = (categoryId) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Filter expenses for current month and category
    const categoryExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.category_id === categoryId && 
             expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    // Sort by amount (highest first)
    return categoryExpenses.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)).slice(0, 5);
  };

  // Render each budget item in card view
  const renderBudgetCardItem = ({ item }) => (
    <TouchableOpacity 
      style={[layout.card, styles.budgetCard]} 
      onPress={() => handleViewBudgetDetail(item)}
    >
      <View style={styles.budgetCardHeader}>
        <Text style={typography.sectionTitle}>{item.category_name}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getProgressColor(item.percentage) }]}>
          <Text style={styles.statusText}>
            {item.percentage >= 100 ? 'Over Budget' : 
             item.percentage >= 75 ? 'Warning' : 'On Track'}
          </Text>
        </View>
      </View>
      
      <View style={styles.budgetCircleContainer}>
        <ProgressCircle
          style={{ height: 100 }}
          progress={item.percentage / 100}
          progressColor={getProgressColor(item.percentage)}
          startAngle={-Math.PI * 0.8}
          endAngle={Math.PI * 0.8}
          strokeWidth={12}
          backgroundColor={theme.colors.gray200}
        />
        <View style={styles.budgetCircleText}>
          <Text style={styles.budgetPercentageText}>{Math.round(item.percentage)}%</Text>
          <Text style={styles.budgetUsedText}>used</Text>
        </View>
      </View>
      
      <View style={styles.budgetDetails}>
        <View style={styles.budgetDetailItem}>
          <Text style={styles.budgetDetailLabel}>Spent</Text>
          <Text style={styles.budgetDetailValue}>{formatCurrency(item.spent)}</Text>
        </View>
        <View style={styles.budgetDetailItem}>
          <Text style={styles.budgetDetailLabel}>Budget</Text>
          <Text style={styles.budgetDetailValue}>{formatCurrency(item.monthly_limit)}</Text>
        </View>
        <View style={styles.budgetDetailItem}>
          <Text style={styles.budgetDetailLabel}>Remaining</Text>
          <Text style={[
            styles.budgetDetailValue, 
            {color: item.percentage >= 100 ? theme.colors.danger : theme.colors.success}
          ]}>
            {formatCurrency(item.remaining)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render each budget item in list view
  const renderBudgetListItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.budgetListItem} 
      onPress={() => handleViewBudgetDetail(item)}
    >
      <View style={layout.rowBetween}>
        <Text style={typography.body}>{item.category_name}</Text>
        <Text style={{
          color: getProgressColor(item.percentage),
          fontWeight: theme.typography.fontWeights.semibold
        }}>
          {formatCurrency(item.spent)} / {formatCurrency(item.monthly_limit)}
        </Text>
      </View>
      <View style={styles.listProgressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${item.percentage}%`, backgroundColor: getProgressColor(item.percentage) }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={layout.container}>
      {/* Budget Summary Header */}
      <View style={styles.header}>
        <Text style={typography.title}>Budget Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      
      {/* Budget Summary Card */}
      {budgetStatus.length > 0 && (
        <View style={[layout.card, styles.summaryCard]}>
          <Text style={typography.sectionTitle}>Monthly Budget Summary</Text>
          <View style={layout.rowBetween}>
            <View>
              <Text style={typography.body}>Total Budget</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalBudget)}</Text>
            </View>
            <View>
              <Text style={typography.body}>Total Spent</Text>
              <Text style={styles.summaryAmount}>{formatCurrency(totalSpent)}</Text>
            </View>
            <View>
              <Text style={typography.body}>Remaining</Text>
              <Text style={[
                styles.summaryAmount, 
                {color: totalSpent > totalBudget ? theme.colors.danger : theme.colors.success}
              ]}>
                {formatCurrency(Math.max(0, totalBudget - totalSpent))}
              </Text>
            </View>
          </View>
          <View style={styles.summaryProgressContainer}>
            <View 
              style={[
                styles.summaryProgress, 
                { width: `${budgetedPercentage}%`, backgroundColor: getProgressColor(budgetedPercentage) }
              ]} 
            />
          </View>
          <Text style={styles.summaryPercentage}>
            {Math.round(budgetedPercentage)}% of total budget used
          </Text>
        </View>
      )}
      
      {/* View mode toggle */}
      {budgetStatus.length > 0 && (
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity 
            style={[
              styles.viewToggleButton, 
              viewMode === 'card' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('card')}
          >
            <Ionicons 
              name="grid-outline" 
              size={20} 
              color={viewMode === 'card' ? theme.colors.white : theme.colors.gray600} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.viewToggleButton, 
              viewMode === 'list' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list-outline" 
              size={20} 
              color={viewMode === 'list' ? theme.colors.white : theme.colors.gray600} 
            />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Budget List */}
      {isLoading ? (
        <View style={[layout.center, {flex: 1}]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : budgetStatus.length > 0 ? (
        <FlatList
          data={budgetStatus}
          renderItem={viewMode === 'card' ? renderBudgetCardItem : renderBudgetListItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          numColumns={viewMode === 'card' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
        />
      ) : (
        <View style={layout.emptyContainer}>
          <Ionicons name="wallet-outline" size={60} color={theme.colors.gray300} />
          <Text style={typography.subtitle}>No budgets set yet</Text>
          <Text style={[typography.body, {textAlign: 'center', marginVertical: theme.spacing.md}]}>
            Set monthly budgets for your expense categories to track your spending better
          </Text>
          <Button 
            title="Add Your First Budget"
            onPress={() => setShowAddModal(true)}
          />
        </View>
      )}
      
      {/* Add Budget Modal */}
      <Modal visible={showAddModal} transparent={true} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={layout.rowBetween}>
              <Text style={typography.subtitle}>Add New Budget</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.gray500} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalForm}>
              <View style={forms.inputGroup}>
                <Text style={typography.label}>Category</Text>
                <View style={forms.pickerButton}>
                  <Picker
                    selectedValue={selectedCategoryId}
                    onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
                    style={{height: 50}}
                  >
                    {categories.map((category) => (
                      <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                  </Picker>
                </View>
                
                <TouchableOpacity 
                  style={styles.addCategoryButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setShowAddCategoryModal(true);
                  }}
                >
                  <Text style={styles.addCategoryText}>+ Add New Category</Text>
                </TouchableOpacity>
              </View>
              
              <Input
                label="Monthly Limit"
                value={monthlyLimit}
                onChangeText={setMonthlyLimit}
                keyboardType="decimal-pad"
                placeholder="0.00"
                leftIcon={<Text style={{color: theme.colors.gray500, marginRight: theme.spacing.sm}}>$</Text>}
              />
              
              <Button
                title="Add Budget"
                onPress={handleAddBudget}
                style={{marginTop: theme.spacing.md}}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal visible={showAddCategoryModal} transparent={true} animationType="slide" onRequestClose={() => setShowAddCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={layout.rowBetween}>
              <Text style={typography.subtitle}>Add New Category</Text>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.gray500} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalForm}>
              <Input
                label="Category Name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Enter category name"
              />
              
              <Input
                label="Monthly Budget (Optional)"
                value={newCategoryBudget}
                onChangeText={setNewCategoryBudget}
                keyboardType="decimal-pad"
                placeholder="0.00"
                leftIcon={<Text style={{color: theme.colors.gray500, marginRight: theme.spacing.sm}}>$</Text>}
              />
              
              <Button
                title="Add Category"
                onPress={handleAddCategory}
                style={{marginTop: theme.spacing.md}}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Budget Detail Modal */}
      <Modal 
        visible={showBudgetDetailModal} 
        transparent={true} 
        animationType="slide" 
        onRequestClose={() => setShowBudgetDetailModal(false)}
      >
        {selectedBudget && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={layout.rowBetween}>
                <Text style={typography.subtitle}>{selectedBudget.category_name} Budget</Text>
                <TouchableOpacity onPress={() => setShowBudgetDetailModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.gray500} />
                </TouchableOpacity>
              </View>
              
              {/* Budget Progress Circle */}
              <View style={styles.detailCircleContainer}>
                <ProgressCircle
                  style={{ height: 150 }}
                  progress={selectedBudget.percentage / 100}
                  progressColor={getProgressColor(selectedBudget.percentage)}
                  startAngle={-Math.PI * 0.8}
                  endAngle={Math.PI * 0.8}
                  strokeWidth={15}
                  backgroundColor={theme.colors.gray200}
                />
                <View style={styles.detailCircleText}>
                  <Text style={styles.detailPercentageText}>{Math.round(selectedBudget.percentage)}%</Text>
                  <Text style={styles.detailUsedText}>used</Text>
                </View>
              </View>
              
              {/* Budget Details */}
              <View style={[layout.rowBetween, styles.detailInfo]}>
                <View style={styles.detailInfoItem}>
                  <Text style={styles.detailInfoLabel}>Monthly Budget</Text>
                  <Text style={styles.detailInfoValue}>{formatCurrency(selectedBudget.monthly_limit)}</Text>
                </View>
                <View style={styles.detailInfoItem}>
                  <Text style={styles.detailInfoLabel}>Spent So Far</Text>
                  <Text style={styles.detailInfoValue}>{formatCurrency(selectedBudget.spent)}</Text>
                </View>
              </View>
              
              <View style={[layout.rowBetween, styles.detailInfo]}>
                <View style={styles.detailInfoItem}>
                  <Text style={styles.detailInfoLabel}>Remaining</Text>
                  <Text style={[
                    styles.detailInfoValue, 
                    {color: selectedBudget.percentage >= 100 ? theme.colors.danger : theme.colors.success}
                  ]}>
                    {formatCurrency(selectedBudget.remaining)}
                  </Text>
                </View>
                <View style={styles.detailInfoItem}>
                  <Text style={styles.detailInfoLabel}>Daily Budget</Text>
                  <Text style={styles.detailInfoValue}>
                    {formatCurrency(selectedBudget.remaining / getDaysLeftInMonth())}
                  </Text>
                </View>
              </View>
              
              {/* Top Expenses */}
              <Text style={[typography.sectionTitle, {marginTop: theme.spacing.lg}]}>
                Top Expenses This Month
              </Text>
              
              {getBudgetTopExpenses(selectedBudget.category_id).length > 0 ? (
                getBudgetTopExpenses(selectedBudget.category_id).map(expense => (
                  <View key={expense.id} style={styles.detailExpenseItem}>
                    <View>
                      <Text style={styles.detailExpenseDescription}>{expense.description}</Text>
                      <Text style={styles.detailExpenseDate}>
                        {new Date(expense.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.detailExpenseAmount}>{formatCurrency(expense.amount)}</Text>
                  </View>
                ))
              ) : (
                <Text style={[typography.body, {color: theme.colors.gray500, fontStyle: 'italic'}]}>
                  No expenses recorded in this category yet.
                </Text>
              )}
              
              {/* Action Buttons */}
              <View style={[layout.rowBetween, {marginTop: theme.spacing.xl}]}>
                <Button
                  title="Add Expense"
                  onPress={() => {
                    setShowBudgetDetailModal(false);
                    navigation.navigate('AddExpense', { 
                      preselectedCategory: selectedBudget.category_id 
                    });
                  }}
                  style={{flex: 1, marginRight: theme.spacing.sm}}
                />
                <Button
                  title="View All"
                  onPress={() => {
                    setShowBudgetDetailModal(false);
                    navigation.navigate('Reports', { 
                      filterByCategory: selectedBudget.category_id 
                    });
                  }}
                  type="secondary"
                  style={{flex: 1, marginLeft: theme.spacing.sm}}
                />
              </View>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

// Helper function to calculate days left in current month
const getDaysLeftInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(1, lastDay.getDate() - now.getDate() + 1); // Ensure at least 1 day
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginHorizontal: theme.spacing.screenPadding,
    marginBottom: theme.spacing.md,
  },
  summaryAmount: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
    marginTop: theme.spacing.xs,
  },
  summaryProgressContainer: {
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: theme.spacing.md,
  },
  summaryProgress: {
    height: '100%',
    borderRadius: 4,
  },
  summaryPercentage: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray500,
    textAlign: 'center',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  viewToggleButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  viewToggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  listContent: {
    padding: theme.spacing.screenPadding,
  },
  budgetCard: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusIndicator: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
  },
  statusText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeights.medium,
    fontSize: theme.typography.fontSizes.xs,
  },
  budgetCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  budgetCircleText: {
    position: 'absolute',
    alignItems: 'center',
  },
  budgetPercentageText: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.gray800,
  },
  budgetUsedText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.gray500,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetDetailItem: {
    alignItems: 'center',
  },
  budgetDetailLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.gray500,
    marginBottom: theme.spacing.xs,
  },
  budgetDetailValue: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.gray800,
  },
  budgetListItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listProgressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalForm: {
    marginTop: theme.spacing.lg,
  },
  addCategoryButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  addCategoryText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  detailCircleContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
    position: 'relative',
  },
  detailCircleText: {
    position: 'absolute',
    alignItems: 'center',
  },
  detailPercentageText: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.gray800,
  },
  detailUsedText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray500,
  },
  detailInfo: {
    marginBottom: theme.spacing.md,
  },
  detailInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailInfoLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray500,
    marginBottom: theme.spacing.xs,
  },
  detailInfoValue: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
  },
  detailExpenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  detailExpenseDescription: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray800,
  },
  detailExpenseDate: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.gray500,
  },
  detailExpenseAmount: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.danger,
  },
});

export default BudgetScreen;