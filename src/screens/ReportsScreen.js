import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../contexts/ExpenseContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
// Theme imports
import { theme, layout, typography } from '../styles';
import { Button } from '../components/ui';
import { getCategoryColor } from '../styles/utils';
import { formatCurrency, formatDate } from '../utils/formatters';

const ReportsScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { expenses, categories, getMonthlyReport, refreshData, isLoading } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly', 'category', 'trends'
  const [selectedView, setSelectedView] = useState('chart'); // 'chart', 'list'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [yearToDateData, setYearToDateData] = useState(null);
  const [spendingInsights, setSpendingInsights] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const screenWidth = Dimensions.get('window').width;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Define color palette for categories
  const COLORS = [
    '#4F46E5', // Indigo (Primary)
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#6366F1', // Indigo (alt)
    '#64748B', // Slate
    '#A855F7', // Purple
  ];
  
  // Check if we should filter by category (passed from Budget screen)
  useEffect(() => {
    if (route.params?.filterByCategory) {
      setSelectedCategoryFilter(route.params.filterByCategory);
      setActiveTab('category');
    }
  }, [route.params]);

  // Load report data when month/year/filter changes
  useEffect(() => {
    loadReportData();
    loadYearToDateData();
    loadMonthlyTrend();
    
    // Run animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentMonth, currentYear, selectedCategoryFilter, expenses]);

  // Load monthly report data
  const loadReportData = () => {
    const report = getMonthlyReport(currentYear, currentMonth + 1);
    
    // Apply category filter if selected
    if (selectedCategoryFilter && report) {
      const filteredReport = {
        ...report,
        categories: report.categories.filter(cat => cat.category_id === selectedCategoryFilter)
      };
      setReportData(filteredReport);
    } else {
      setReportData(report);
    }
    
    // Generate spending insights
    generateInsights(report);
  };

  // Load year-to-date spending data
  const loadYearToDateData = () => {
    const currentDate = new Date();
    const ytdExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear && 
             expenseDate.getMonth() <= currentDate.getMonth();
    });
    
    // Calculate total and by category
    const total = ytdExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Group by category
    const categoryTotals = {};
    ytdExpenses.forEach(expense => {
      const categoryId = expense.category_id;
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          category_id: categoryId,
          category_name: expense.category_name,
          total: 0
        };
      }
      categoryTotals[categoryId].total += parseFloat(expense.amount);
    });
    
    setYearToDateData({
      total,
      categories: Object.values(categoryTotals).sort((a, b) => b.total - a.total)
    });
  };

  // Load monthly spending trend (last 6 months)
  const loadMonthlyTrend = () => {
    const trendData = [];
    const currentDate = new Date();
    
    // Get data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthYear = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      
      const monthData = getMonthlyReport(monthYear, monthNum);
      const monthName = month.toLocaleDateString('default', { month: 'short' });
      
      trendData.push({
        month: monthName,
        amount: monthData ? monthData.total : 0
      });
    }
    
    setMonthlyTrend(trendData);
  };

  // Generate spending insights based on the data
  const generateInsights = (report) => {
    const insights = [];
    
    if (!report || report.total === 0) return;
    
    // Top spending category insight
    if (report.categories.length > 0) {
      const topCategory = [...report.categories].sort((a, b) => b.total - a.total)[0];
      const topCategoryPercentage = ((topCategory.total / report.total) * 100).toFixed(1);
      
      insights.push({
        type: 'top-category',
        icon: 'trending-up',
        title: `${topCategory.category_name} is your top spending category`,
        description: `${topCategoryPercentage}% of your spending (${formatCurrency(topCategory.total)}) went to ${topCategory.category_name} this month.`
      });
    }
    
    // Month-over-month comparison (if we have previous month data)
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthYear = prevMonthDate.getFullYear();
    const prevMonthNum = prevMonthDate.getMonth() + 1;
    const prevMonthReport = getMonthlyReport(prevMonthYear, prevMonthNum);
    
    if (prevMonthReport && prevMonthReport.total > 0) {
      const changePercentage = ((report.total - prevMonthReport.total) / prevMonthReport.total * 100).toFixed(1);
      const isIncrease = report.total > prevMonthReport.total;
      
      insights.push({
        type: 'month-comparison',
        icon: isIncrease ? 'arrow-up-circle' : 'arrow-down-circle',
        title: `${isIncrease ? 'Increased' : 'Decreased'} spending from last month`,
        description: `You spent ${isIncrease ? '+' : ''}${changePercentage}% (${formatCurrency(Math.abs(report.total - prevMonthReport.total))}) ${isIncrease ? 'more' : 'less'} than last month.`
      });
    }
    
    // Unusual spending (if any category is 50% higher than average)
    if (report.categories.length > 0 && expenses.length > 0) {
      report.categories.forEach(category => {
        // Calculate average spending for this category over the last 3 months
        const last3Months = [];
        for (let i = 1; i <= 3; i++) {
          const monthDate = new Date(currentYear, currentMonth - i, 1);
          const monthYear = monthDate.getFullYear();
          const monthNum = monthDate.getMonth() + 1;
          const monthReport = getMonthlyReport(monthYear, monthNum);
          
          if (monthReport) {
            const categorySpendings = monthReport.categories.find(c => c.category_id === category.category_id);
            if (categorySpendings) {
              last3Months.push(categorySpendings.total);
            }
          }
        }
        
        if (last3Months.length > 0) {
          const avgSpending = last3Months.reduce((sum, val) => sum + val, 0) / last3Months.length;
          if (category.total > avgSpending * 1.5 && category.total > 50) { // 50% higher and at least $50
            insights.push({
              type: 'unusual-spending',
              icon: 'alert-circle',
              title: `Higher than usual ${category.category_name} spending`,
              description: `You spent ${formatCurrency(category.total)} on ${category.category_name}, which is ${Math.round((category.total / avgSpending - 1) * 100)}% higher than your average.`
            });
          }
        }
      });
    }
    
    // Days remaining in month with daily budget (if we have spending)
    if (report.total > 0) {
      const today = new Date();
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      const daysRemaining = lastDayOfMonth.getDate() - today.getDate() + 1;
      
      if (daysRemaining > 0 && today.getMonth() === currentMonth) {
        insights.push({
          type: 'days-remaining',
          icon: 'calendar',
          title: `${daysRemaining} days left in this month`,
          description: `You've spent ${formatCurrency(report.total)} so far. That's about ${formatCurrency(report.total / (today.getDate()))} per day.`
        });
      }
    }
    
    setSpendingInsights(insights);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    loadReportData();
    loadYearToDateData();
    loadMonthlyTrend();
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

  const getMonthName = (month) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  };

  // Get data for pie chart
  const getPieChartData = () => {
    if (!reportData || !reportData.categories || reportData.categories.length === 0) {
      return [{ name: 'No Data', amount: 1, color: theme.colors.gray300, legendFontColor: theme.colors.gray500 }];
    }
    
    // Sort categories by total (highest first)
    const sortedCategories = [...reportData.categories].sort((a, b) => b.total - a.total);
    
    // If there are too many categories, group smaller ones as "Other"
    const MAX_SLICES = 6;
    let chartData = [];
    
    if (sortedCategories.length > MAX_SLICES) {
      // Take the top categories
      const topCategories = sortedCategories.slice(0, MAX_SLICES - 1);
      
      // Create data for top categories
      chartData = topCategories.map((category, index) => ({
        name: category.category_name,
        amount: category.total,
        color: COLORS[index % COLORS.length],
        legendFontColor: theme.colors.gray800,
        legendFontSize: 12
      }));
      
      // Group remaining categories
      const otherCategories = sortedCategories.slice(MAX_SLICES - 1);
      const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.total, 0);
      
      // Add "Other" category
      chartData.push({
        name: 'Other',
        amount: otherTotal,
        color: COLORS[MAX_SLICES - 1],
        legendFontColor: theme.colors.gray800,
        legendFontSize: 12
      });
    } else {
      // If we have a manageable number of categories, show them all
      chartData = sortedCategories.map((category, index) => ({
        name: category.category_name,
        amount: category.total,
        color: COLORS[index % COLORS.length],
        legendFontColor: theme.colors.gray800,
        legendFontSize: 12
      }));
    }
    
    return chartData;
  };

  // Get data for trend chart (line chart)
  const getTrendChartData = () => {
    return {
      labels: monthlyTrend.map(item => item.month),
      datasets: [
        {
          data: monthlyTrend.map(item => item.amount),
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Monthly Spending']
    };
  };

  // Get data for category comparison chart (bar chart)
  const getCategoryComparisonData = () => {
    if (!yearToDateData || !yearToDateData.categories || yearToDateData.categories.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }
    
    // Get top categories (limit to 6 for visibility)
    const topCategories = yearToDateData.categories.slice(0, 6);
    
    return {
      labels: topCategories.map(cat => cat.category_name.substring(0, 8)),
      datasets: [
        {
          data: topCategories.map(cat => cat.total)
        }
      ]
    };
  };

  // Create export data for sharing
  const exportReportData = async () => {
    if (!reportData) return;
    
    let exportText = `Expense Report for ${getMonthName(currentMonth)} ${currentYear}\n\n`;
    exportText += `Total Spending: ${formatCurrency(reportData.total)}\n\n`;
    exportText += `Breakdown by Category:\n`;
    
    reportData.categories.sort((a, b) => b.total - a.total).forEach(category => {
      const percentage = ((category.total / reportData.total) * 100).toFixed(1);
      exportText += `- ${category.category_name}: ${formatCurrency(category.total)} (${percentage}%)\n`;
    });
    
    try {
      await Share.share({
        message: exportText,
        title: `${getMonthName(currentMonth)} ${currentYear} Expense Report`
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    setSelectedCategoryFilter(null);
    loadReportData();
  };

  // Render Tab Bar
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'monthly' && styles.activeTab]}
        onPress={() => setActiveTab('monthly')}
      >
        <Ionicons 
          name="calendar-outline" 
          size={18} 
          color={activeTab === 'monthly' ? theme.colors.primary : theme.colors.gray600} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'monthly' && styles.activeTabText
        ]}>
          Monthly
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'category' && styles.activeTab]}
        onPress={() => setActiveTab('category')}
      >
        <Ionicons 
          name="pie-chart-outline" 
          size={18} 
          color={activeTab === 'category' ? theme.colors.primary : theme.colors.gray600} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'category' && styles.activeTabText
        ]}>
          Categories
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'trends' && styles.activeTab]}
        onPress={() => setActiveTab('trends')}
      >
        <Ionicons 
          name="trending-up-outline" 
          size={18} 
          color={activeTab === 'trends' ? theme.colors.primary : theme.colors.gray600} 
        />
        <Text style={[
          styles.tabText, 
          activeTab === 'trends' && styles.activeTabText
        ]}>
          Trends
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render Monthly Tab Content
  const renderMonthlyTab = () => (
    <View>
      {/* Month selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.monthButton} onPress={goToPreviousMonth}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {getMonthName(currentMonth)} {currentYear}
        </Text>
        <TouchableOpacity style={styles.monthButton} onPress={goToNextMonth}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Monthly summary card */}
      <View style={layout.card}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : reportData && reportData.total > 0 ? (
          <>
            <View style={styles.totalContainer}>
              <Text style={typography.caption}>Total Spending</Text>
              <Text style={styles.totalAmount}>{formatCurrency(reportData.total)}</Text>
              <Text style={[typography.caption, {color: theme.colors.gray400}]}>
                {`${getMonthName(currentMonth)} 1 - ${getMonthName(currentMonth)} ${new Date(currentYear, currentMonth + 1, 0).getDate()}, ${currentYear}`}
              </Text>
            </View>
            
            {/* Category breakdown chart */}
            <View style={styles.chartContainer}>
              <PieChart
                data={getPieChartData()}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={false}
              />
            </View>
            
            {/* View toggle for chart/list */}
            <View style={styles.viewToggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.viewToggleButton, 
                  selectedView === 'chart' && styles.viewToggleButtonActive
                ]}
                onPress={() => setSelectedView('chart')}
              >
                <Ionicons 
                  name="pie-chart-outline" 
                  size={18} 
                  color={selectedView === 'chart' ? theme.colors.white : theme.colors.gray600} 
                />
                <Text style={[
                  styles.viewToggleText, 
                  selectedView === 'chart' && styles.viewToggleTextActive
                ]}>
                  Chart
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.viewToggleButton, 
                  selectedView === 'list' && styles.viewToggleButtonActive
                ]}
                onPress={() => setSelectedView('list')}
              >
                <Ionicons 
                  name="list-outline" 
                  size={18} 
                  color={selectedView === 'list' ? theme.colors.white : theme.colors.gray600} 
                />
                <Text style={[
                  styles.viewToggleText, 
                  selectedView === 'list' && styles.viewToggleTextActive
                ]}>
                  List
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Category breakdown list or chart */}
            {selectedView === 'list' ? (
              <View style={styles.categoryBreakdown}>
                <Text style={typography.sectionTitle}>Category Breakdown</Text>
                {reportData.categories.sort((a, b) => b.total - a.total).map((category, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.categoryItem}
                    onPress={() => {
                      setSelectedCategoryFilter(category.category_id);
                      setActiveTab('category');
                    }}
                  >
                    <View style={styles.categoryLeft}>
                      <View 
                        style={[
                          styles.categoryColorDot, 
                          { backgroundColor: COLORS[index % COLORS.length] }
                        ]} 
                      />
                      <Text style={styles.categoryName}>{category.category_name}</Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryAmount}>{formatCurrency(category.total)}</Text>
                      <Text style={styles.categoryPercentage}>
                        {((category.total / reportData.total) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            
            {/* Insights section */}
            {spendingInsights.length > 0 && (
              <View style={styles.insightsContainer}>
                <Text style={[typography.sectionTitle, {marginBottom: theme.spacing.md}]}>
                  Spending Insights
                </Text>
                
                {spendingInsights.map((insight, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.insightCard,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                      }
                    ]}
                  >
                    <View style={[
                      styles.insightIconContainer,
                      { backgroundColor: getInsightColor(insight.type) }
                    ]}>
                      <Ionicons name={insight.icon} size={20} color={theme.colors.white} />
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <Text style={styles.insightDescription}>{insight.description}</Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={70} color={theme.colors.gray300} />
            <Text style={typography.subtitle}>No Data Available</Text>
            <Text style={[typography.body, {textAlign: 'center', marginVertical: theme.spacing.md}]}>
              You haven't recorded any expenses for {getMonthName(currentMonth)} {currentYear}
            </Text>
            <Button 
              title="Add Your First Expense"
              onPress={() => navigation.navigate('AddExpense')}
            />
          </View>
        )}
      </View>
    </View>
  );

  // Render Category Tab Content
  const renderCategoryTab = () => (
    <View>
      {selectedCategoryFilter ? (
        <View style={styles.filterInfoContainer}>
          <Text style={styles.filterInfoText}>
            Showing expenses for: {categories.find(c => c.id === selectedCategoryFilter)?.name || 'Selected Category'}
          </Text>
          <TouchableOpacity 
            style={styles.clearFilterButton}
            onPress={clearCategoryFilter}
          >
            <Text style={styles.clearFilterText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      
      <View style={layout.card}>
        <Text style={typography.subtitle}>Year-to-Date Analysis</Text>
        
        {yearToDateData && yearToDateData.total > 0 ? (
          <>
            <View style={styles.ytdSummary}>
              <Text style={typography.body}>Total Spent in {currentYear}</Text>
              <Text style={styles.ytdAmount}>{formatCurrency(yearToDateData.total)}</Text>
            </View>
            
            {/* Bar chart for category comparison */}
            <Text style={[typography.sectionTitle, {marginTop: theme.spacing.lg}]}>
              Top Categories
            </Text>
            
            <BarChart
              data={getCategoryComparisonData()}
              width={screenWidth - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: theme.colors.white,
                backgroundGradientFrom: theme.colors.white,
                backgroundGradientTo: theme.colors.white,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: theme.borderRadius.lg },
              }}
              style={styles.categoryChart}
            />
            
            {/* Top Categories List */}
            <Text style={[typography.sectionTitle, {marginTop: theme.spacing.lg}]}>
              Category Breakdown
            </Text>
            
            {yearToDateData.categories.slice(0, 10).map((category, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.ytdCategoryItem}
                onPress={() => setSelectedCategoryFilter(category.category_id)}
              >
                <View style={styles.categoryLeft}>
                  <View 
                    style={[
                      styles.categoryColorDot, 
                      { backgroundColor: COLORS[index % COLORS.length] }
                    ]} 
                  />
                  <Text style={styles.categoryName}>{category.category_name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryAmount}>{formatCurrency(category.total)}</Text>
                  <Text style={styles.categoryPercentage}>
                    {((category.total / yearToDateData.total) * 100).toFixed(1)}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={60} color={theme.colors.gray300} />
            <Text style={[typography.body, {textAlign: 'center', marginTop: theme.spacing.md}]}>
              No expense data available for {currentYear}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Render Trends Tab Content
  const renderTrendsTab = () => (
    <View>
      <View style={layout.card}>
        <Text style={typography.subtitle}>Monthly Spending Trends</Text>
        
        {monthlyTrend.some(item => item.amount > 0) ? (
          <>
            <LineChart
              data={getTrendChartData()}
              width={screenWidth - 40}
              height={220}
              yAxisLabel="$"
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
              style={styles.trendChart}
            />
            
            <View style={styles.trendAnalysis}>
              <Text style={typography.sectionTitle}>Analysis</Text>
              
              {/* Average monthly spending */}
              <View style={styles.trendStat}>
                <Text style={styles.trendStatLabel}>Average Monthly Spending</Text>
                <Text style={styles.trendStatValue}>
                  {formatCurrency(
                    monthlyTrend.reduce((sum, item) => sum + item.amount, 0) / 
                    monthlyTrend.filter(item => item.amount > 0).length || 0
                  )}
                </Text>
              </View>
              
              {/* Highest spending month */}
              {monthlyTrend.length > 0 && (
                <View style={styles.trendStat}>
                  <Text style={styles.trendStatLabel}>Highest Spending Month</Text>
                  <Text style={styles.trendStatValue}>
                    {(() => {
                      const highest = [...monthlyTrend].sort((a, b) => b.amount - a.amount)[0];
                      return `${highest.month} (${formatCurrency(highest.amount)})`;
                    })()}
                  </Text>
                </View>
              )}
              
              {/* Spending direction */}
              {monthlyTrend.length >= 2 && (
                <View style={styles.trendStat}>
                  <Text style={styles.trendStatLabel}>Spending Trend</Text>
                  <Text style={[
                    styles.trendStatValue,
                    {
                      color: monthlyTrend[monthlyTrend.length - 1].amount > monthlyTrend[monthlyTrend.length - 2].amount
                        ? theme.colors.danger
                        : theme.colors.success
                    }
                  ]}>
                    {monthlyTrend[monthlyTrend.length - 1].amount > monthlyTrend[monthlyTrend.length - 2].amount
                      ? 'Increasing ↑'
                      : 'Decreasing ↓'}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Monthly comparison table */}
            <View style={styles.monthlyComparisonContainer}>
              <Text style={[typography.sectionTitle, {marginBottom: theme.spacing.md}]}>
                Monthly Comparison
              </Text>
              
              <View style={styles.monthlyComparisonHeader}>
                <Text style={styles.monthColumnHeader}>Month</Text>
                <Text style={styles.amountColumnHeader}>Amount</Text>
                <Text style={styles.changeColumnHeader}>Change</Text>
              </View>
              
              {monthlyTrend.map((item, index) => {
                const prevAmount = index > 0 ? monthlyTrend[index - 1].amount : 0;
                const change = prevAmount > 0 ? ((item.amount - prevAmount) / prevAmount * 100).toFixed(1) : 0;
                
                return (
                  <View key={index} style={styles.monthlyComparisonRow}>
                    <Text style={styles.monthColumn}>{item.month}</Text>
                    <Text style={styles.amountColumn}>{formatCurrency(item.amount)}</Text>
                    {index > 0 ? (
                      <Text style={[
                        styles.changeColumn,
                        {
                          color: parseFloat(change) > 0 
                            ? theme.colors.danger 
                            : parseFloat(change) < 0 
                              ? theme.colors.success 
                              : theme.colors.gray600
                        }
                      ]}>
                        {parseFloat(change) > 0 ? '+' : ''}{change}%
                      </Text>
                    ) : (
                      <Text style={styles.changeColumn}>-</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="trending-up-outline" size={60} color={theme.colors.gray300} />
            <Text style={[typography.body, {textAlign: 'center', marginTop: theme.spacing.md}]}>
              Not enough data to show trends yet.
              Add expenses for multiple months to see your spending patterns.
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Helper function to determine insight card color
  const getInsightColor = (type) => {
    switch (type) {
      case 'top-category':
        return theme.colors.info;
      case 'month-comparison':
        return theme.colors.success;
      case 'unusual-spending':
        return theme.colors.warning;
      case 'days-remaining':
        return theme.colors.primary;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <SafeAreaView style={layout.container}>
      <View style={styles.header}>
        <Text style={typography.title}>Expense Reports</Text>
        {reportData && reportData.total > 0 && (
          <TouchableOpacity onPress={exportReportData}>
            <Ionicons name="share-outline" size={24} color={theme.colors.gray800} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Tab Bar */}
      {renderTabBar()}
      
      <ScrollView
        contentContainerStyle={layout.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Tab Content */}
        {activeTab === 'monthly' && renderMonthlyTab()}
        {activeTab === 'category' && renderCategoryTab()}
        {activeTab === 'trends' && renderTrendsTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.screenPadding,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray600,
    marginLeft: theme.spacing.xs,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  monthButton: {
    padding: theme.spacing.sm,
  },
  monthText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
    paddingHorizontal: theme.spacing.lg,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  totalAmount: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.gray800,
    marginVertical: theme.spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
  },
  viewToggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  viewToggleText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray600,
    marginLeft: theme.spacing.xs,
  },
  viewToggleTextActive: {
    color: theme.colors.white,
  },
  categoryBreakdown: {
    marginTop: theme.spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  categoryName: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray800,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray500,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  insightsContainer: {
    marginTop: theme.spacing.xl,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray600,
  },
  filterInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray100,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.screenPadding,
  },
  filterInfoText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray700,
    flex: 1,
  },
  clearFilterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
  },
  clearFilterText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  ytdSummary: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  ytdAmount: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.gray800,
    marginTop: theme.spacing.xs,
  },
  categoryChart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  ytdCategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  trendChart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  trendAnalysis: {
    marginTop: theme.spacing.md,
  },
  trendStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  trendStatLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray700,
  },
  trendStatValue: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
  },
  monthlyComparisonContainer: {
    marginTop: theme.spacing.xl,
  },
  monthlyComparisonHeader: {
    flexDirection: 'row',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.gray300,
  },
  monthColumnHeader: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray600,
  },
  amountColumnHeader: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray600,
    textAlign: 'right',
  },
  changeColumnHeader: {
    width: 80,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray600,
    textAlign: 'right',
  },
  monthlyComparisonRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  monthColumn: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray800,
  },
  amountColumn: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray800,
    textAlign: 'right',
  },
  changeColumn: {
    width: 80,
    fontSize: theme.typography.fontSizes.md,
    textAlign: 'right',
  },
});

export default ReportsScreen;