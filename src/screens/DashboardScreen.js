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

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { expenses, budgets, getMonthlyReport, getBudgetStatus, refreshData, isLoading } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const report = getMonthlyReport(currentYear, currentMonth);
    setMonthlyData(report);
    const status = getBudgetStatus();
    setBudgetStatus(status);
  }, [expenses, budgets, getMonthlyReport, getBudgetStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getDailyExpenseData = () => {
    if (!expenses || expenses.length === 0) {
      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [{ data: [0, 0, 0, 0] }]
      };
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const report = getMonthlyReport(currentYear, currentMonth);
    const weeklyData = [0, 0, 0, 0, 0];
    if (report && report.categories) {
      const monthExpenses = expenses.filter(expense => {
        const date = new Date(expense.date);
        return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear;
      });
      monthExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
      monthExpenses.forEach(expense => {
        const date = new Date(expense.date);
        const dayOfMonth = date.getDate();
        const weekIndex = Math.min(4, Math.floor((dayOfMonth - 1) / 7));
        weeklyData[weekIndex] += parseFloat(expense.amount);
      });
    }
    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{ data: weeklyData.slice(0, 4) }]
    };
  };

  const getRecentExpenses = () => {
    if (!expenses || expenses.length === 0) {
      return [];
    }
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted.slice(0, 5);
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.username || 'User'}
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Overview</Text>
          {isLoading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Total Expenses</Text>
                <Text style={styles.overviewValue}>
                  {monthlyData ? formatAmount(monthlyData.total) : '$0.00'}
                </Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Top Category</Text>
                <Text style={styles.overviewValue}>
                  {monthlyData && monthlyData.categories.length > 0
                    ? monthlyData.categories.sort((a, b) => b.total - a.total)[0].category_name
                    : 'None'}
                </Text>
              </View>
            </>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Expense Trend</Text>
          {isLoading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : (
            <LineChart
              data={getDailyExpenseData()}
              width={screenWidth - 50}
              height={220}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "6", strokeWidth: "2", stroke: "#4F46E5" }
              }}
              bezier
              style={styles.chart}
            />
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget Status</Text>
          {isLoading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : budgetStatus.length > 0 ? (
            budgetStatus.slice(0, 3).map((budget) => (
              <View key={budget.id} style={styles.budgetItem}>
                <View style={styles.budgetInfo}>
                  <Text style={styles.budgetCategory}>{budget.category_name}</Text>
                  <Text style={styles.budgetProgress}>
                    {formatAmount(budget.spent)} / {formatAmount(budget.monthly_limit)}
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${budget.percentage}%`,
                        backgroundColor: budget.status === 'danger' ? '#EF4444' : budget.status === 'warning' ? '#F59E0B' : '#10B981'
                      }
                    ]} 
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No budget set yet</Text>
          )}
          {budgetStatus.length > 0 && (
            <TouchableOpacity style={styles.viewMoreButton} onPress={() => navigation.navigate('Budget')}>
              <Text style={styles.viewMoreText}>View All Budgets</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Expenses</Text>
          {isLoading ? (
            <ActivityIndicator color="#4F46E5" />
          ) : getRecentExpenses().length > 0 ? (
            getRecentExpenses().map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseLeft}>
                  <View style={styles.expenseIconContainer}>
                    <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <Text style={styles.expenseCategory}>{expense.category_name}</Text>
                  </View>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>{formatAmount(expense.amount)}</Text>
                  <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No expenses yet</Text>
          )}
          {expenses.length > 0 && (
            <TouchableOpacity style={styles.addExpenseButton} onPress={() => navigation.navigate('AddExpense')}>
              <Text style={styles.addExpenseText}>Add Expense</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (existing styles remain unchanged)
});

export default DashboardScreen;
