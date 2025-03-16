import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../contexts/ExpenseContext';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
// Theme imports
import { theme, layout, typography } from '../styles';
import { getProgressColor } from '../styles/utils';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/ui';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { expenses, budgets, getMonthlyReport, getBudgetStatus, refreshData, isLoading } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadDashboardData();
  }, [expenses, budgets, getMonthlyReport, getBudgetStatus]);

  const loadDashboardData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const report = getMonthlyReport(currentYear, currentMonth);
    setMonthlyData(report);
    const status = getBudgetStatus();
    setBudgetStatus(status);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    loadDashboardData();
    setRefreshing(false);
  };

  const getDailyExpenseData = () => {
    // Default empty chart data
    const defaultData = {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{ data: [0, 0, 0, 0] }]
    };

    if (!expenses || expenses.length === 0) {
      return defaultData;
    }

    // Get current month and year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Filter expenses for the current month only
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
    
    if (monthExpenses.length === 0) {
      return defaultData;
    }
    
    // Initialize weekly data array
    const weeklyData = [0, 0, 0, 0, 0]; // 5 weeks to handle edge cases
    
    // Group expenses by week
    monthExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const dayOfMonth = expenseDate.getDate();
      
      // Calculate week index (0-based)
      const weekIndex = Math.min(4, Math.floor((dayOfMonth - 1) / 7));
      
      // Add expense amount to the corresponding week
      weeklyData[weekIndex] += parseFloat(expense.amount);
    });
    
    // Round to 2 decimal places for better display
    const roundedData = weeklyData.slice(0, 4).map(amount => Math.round(amount * 100) / 100);
    
    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{ data: roundedData }]
    };
  };

  const getRecentExpenses = () => {
    if (!expenses || expenses.length === 0) {
      return [];
    }
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted.slice(0, 5);
  };

  return (
    <SafeAreaView style={layout.container}>
      <ScrollView
        contentContainerStyle={layout.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeSection}>
          <Text style={typography.title}>Welcome back, {user?.username || 'User'}</Text>
          <Text style={typography.caption}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        {/* Monthly Overview Card */}
        <View style={layout.card}>
          <Text style={typography.sectionTitle}>Monthly Overview</Text>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : (
            <>
              <View style={layout.rowBetween}>
                <Text style={typography.body}>Total Expenses</Text>
                <Text style={styles.overviewValue}>
                  {monthlyData ? formatCurrency(monthlyData.total) : '$0.00'}
                </Text>
              </View>
              <View style={[layout.rowBetween, {marginTop: theme.spacing.md}]}>
                <Text style={typography.body}>Top Category</Text>
                <Text style={styles.overviewValue}>
                  {monthlyData && monthlyData.categories.length > 0
                    ? monthlyData.categories.sort((a, b) => b.total - a.total)[0].category_name
                    : 'None'}
                </Text>
              </View>
            </>
          )}
        </View>
        
        {/* Expense Trend Card */}
        <View style={layout.card}>
          <Text style={typography.sectionTitle}>Expense Trend</Text>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : (
            <LineChart
              data={getDailyExpenseData()}
              width={screenWidth - 50}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.white,
                backgroundGradientFrom: theme.colors.white,
                backgroundGradientTo: theme.colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: theme.borderRadius.lg },
                propsForDots: { r: "6", strokeWidth: "2", stroke: theme.colors.primary }
              }}
              bezier
              style={styles.chart}
            />
          )}
        </View>
        
        {/* Budget Status Card */}
        <View style={layout.card}>
          <Text style={typography.sectionTitle}>Budget Status</Text>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : budgetStatus.length > 0 ? (
            <>
              {budgetStatus.slice(0, 3).map((budget) => (
                <View key={budget.id} style={styles.budgetItem}>
                  <View style={layout.rowBetween}>
                    <Text style={styles.budgetCategory}>{budget.category_name}</Text>
                    <Text style={styles.budgetProgress}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.monthly_limit)}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${budget.percentage}%`,
                          backgroundColor: getProgressColor(budget.percentage)
                        }
                      ]} 
                    />
                  </View>
                </View>
              ))}
              
              {budgetStatus.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewMoreButton} 
                  onPress={() => navigation.navigate('Budget')}
                >
                  <Text style={styles.viewMoreText}>View All Budgets</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyText}>No budget set yet</Text>
              <Button 
                title="Set Budget"
                onPress={() => navigation.navigate('Budget')}
                type="secondary"
                style={{marginTop: theme.spacing.md}}
              />
            </View>
          )}
        </View>
        
        {/* Recent Expenses Card */}
        <View style={layout.card}>
          <Text style={typography.sectionTitle}>Recent Expenses</Text>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : getRecentExpenses().length > 0 ? (
            <>
              {getRecentExpenses().map((expense) => (
                <TouchableOpacity 
                  key={expense.id} 
                  style={styles.expenseItem}
                  onPress={() => navigation.navigate('EditExpense', { expenseId: expense.id })}
                >
                  <View style={styles.expenseLeft}>
                    <View style={[styles.expenseIconContainer, { backgroundColor: theme.colors.primary }]}>
                      <Ionicons name="cart-outline" size={20} color={theme.colors.white} />
                    </View>
                    <View>
                      <Text style={styles.expenseDescription}>{expense.description}</Text>
                      <Text style={styles.expenseCategory}>{expense.category_name}</Text>
                    </View>
                  </View>
                  <View style={styles.expenseRight}>
                    <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                    <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              <Button
                title="Add Expense"
                onPress={() => navigation.navigate('AddExpense')}
                style={{marginTop: theme.spacing.md}}
              />
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyText}>No expenses recorded yet</Text>
              <Button 
                title="Add Expense"
                onPress={() => navigation.navigate('AddExpense')}
                style={{marginTop: theme.spacing.md}}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  overviewValue: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  budgetItem: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  budgetCategory: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.gray800,
  },
  budgetProgress: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray600,
  },
  progressBarContainer: {
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
  viewMoreButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    marginTop: theme.spacing.sm,
  },
  viewMoreText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  expenseDescription: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.gray800,
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray500,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.danger,
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray500,
  },
});

export default DashboardScreen;