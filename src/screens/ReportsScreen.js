import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useExpenses } from '../contexts/ExpenseContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReportsScreen = () => {
  const { expenses, getMonthlyReport, refreshData, isLoading } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const screenWidth = Dimensions.get('window').width;
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

  useEffect(() => {
    const report = getMonthlyReport(currentYear, currentMonth + 1);
    setReportData(report);
  }, [currentMonth, currentYear, expenses, getMonthlyReport]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    const report = getMonthlyReport(currentYear, currentMonth + 1);
    setReportData(report);
    setRefreshing(false);
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getMonthName = (month) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  };

  const getPieChartData = () => {
    if (!reportData || !reportData.categories || reportData.categories.length === 0) {
      return [{ name: 'No Data', amount: 1, color: '#CBD5E1', legendFontColor: '#64748B' }];
    }
    return reportData.categories.map((category, index) => ({
      name: category.category_name,
      amount: category.total,
      color: COLORS[index % COLORS.length],
      legendFontColor: '#1E293B',
      legendFontSize: 12
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text style={styles.title}>Expense Reports</Text>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthButton} onPress={goToPreviousMonth}>
            <Ionicons name="chevron-back" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {getMonthName(currentMonth)} {currentYear}
          </Text>
          <TouchableOpacity style={styles.monthButton} onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4F46E5" />
          ) : reportData && reportData.total > 0 ? (
            <>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Spending</Text>
                <Text style={styles.totalAmount}>{formatAmount(reportData.total)}</Text>
              </View>
              <View style={styles.chartContainer}>
                <PieChart
                  data={getPieChartData()}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
              <View style={styles.categoryBreakdown}>
                <Text style={styles.sectionTitle}>Category Breakdown</Text>
                {reportData.categories.sort((a, b) => b.total - a.total).map((category, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryColorDot, { backgroundColor: COLORS[index % COLORS.length] }]} />
                      <Text style={styles.categoryName}>{category.category_name}</Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryAmount}>{formatAmount(category.total)}</Text>
                      <Text style={styles.categoryPercentage}>{((category.total / reportData.total) * 100).toFixed(1)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bar-chart-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>No expenses recorded for this month</Text>
              <TouchableOpacity style={styles.addExpenseButton} onPress={() => navigation.navigate('AddExpense')}>
                <Text style={styles.addExpenseText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {reportData && reportData.total > 0 && (
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exportButtonText}>Export Report</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (existing styles remain unchanged)
});

export default ReportsScreen;
