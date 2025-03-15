import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

// Create the context
const ExpenseContext = createContext();

// Custom hook to use the expense context
export const useExpenses = () => useContext(ExpenseContext);

// Initial categories
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food', budget_limit: 500 },
  { id: 2, name: 'Transport', budget_limit: 300 },
  { id: 3, name: 'Entertainment', budget_limit: 200 },
  { id: 4, name: 'Shopping', budget_limit: 400 },
  { id: 5, name: 'Bills', budget_limit: 800 },
  { id: 6, name: 'Health', budget_limit: 300 },
  { id: 7, name: 'Other', budget_limit: null }
];

// Helper to generate unique IDs for local storage
const generateId = () => Math.floor(Math.random() * 1000000) + Date.now();

// Helper to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get the current month's start and end dates
const getCurrentMonthRange = () => {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { startDate, endDate };
};

// Expense provider component
export const ExpenseProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from AsyncStorage when the component mounts or user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      // Clear data when not authenticated
      setExpenses([]);
      setCategories(DEFAULT_CATEGORIES);
      setBudgets([]);
    }
  }, [isAuthenticated, user]);

  // Load all data from AsyncStorage
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load expenses
      const storedExpenses = await AsyncStorage.getItem('expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }

      // Load categories
      const storedCategories = await AsyncStorage.getItem('categories');
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        // If no categories found, store the defaults
        await AsyncStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
      }

      // Load budgets
      const storedBudgets = await AsyncStorage.getItem('budgets');
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
    } catch (error) {
      console.error('Failed to load data from storage', error);
      Alert.alert('Error', 'Failed to load your expense data');
    } finally {
      setIsLoading(false);
    }
  };

  // Save expenses to AsyncStorage
  const saveExpenses = async (updatedExpenses) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Failed to save expenses', error);
      Alert.alert('Error', 'Failed to save expense data');
    }
  };

  // Save categories to AsyncStorage
  const saveCategories = async (updatedCategories) => {
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to save categories', error);
      Alert.alert('Error', 'Failed to save category data');
    }
  };

  // Save budgets to AsyncStorage
  const saveBudgets = async (updatedBudgets) => {
    try {
      await AsyncStorage.setItem('budgets', JSON.stringify(updatedBudgets));
      setBudgets(updatedBudgets);
    } catch (error) {
      console.error('Failed to save budgets', error);
      Alert.alert('Error', 'Failed to save budget data');
    }
  };

  // Add a new expense
  const addExpense = async (expense) => {
    setIsLoading(true);
    try {
      const newExpense = {
        id: generateId(),
        user_id: user?.id || 1,
        ...expense,
        date: expense.date || formatDate(new Date()),
        created_at: new Date().toISOString()
      };

      // Get category name for the expense
      const category = categories.find(c => c.id === expense.category_id);
      if (category) {
        newExpense.category_name = category.name;
      }

      const updatedExpenses = [...expenses, newExpense];
      await saveExpenses(updatedExpenses);
      return true;
    } catch (error) {
      console.error('Add expense error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing expense
  const updateExpense = async (id, updatedData) => {
    setIsLoading(true);
    try {
      const updatedExpenses = expenses.map(expense => {
        if (expense.id === id) {
          const updated = { ...expense, ...updatedData };
          
          // Get category name for the expense if category changed
          if (updatedData.category_id && updated.category_id !== expense.category_id) {
            const category = categories.find(c => c.id === updatedData.category_id);
            if (category) {
              updated.category_name = category.name;
            }
          }
          
          return updated;
        }
        return expense;
      });

      await saveExpenses(updatedExpenses);
      return true;
    } catch (error) {
      console.error('Update expense error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an expense
  const deleteExpense = async (id) => {
    setIsLoading(true);
    try {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      await saveExpenses(updatedExpenses);
      return true;
    } catch (error) {
      console.error('Delete expense error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new category
  const addCategory = async (category) => {
    setIsLoading(true);
    try {
      const newCategory = {
        id: generateId(),
        ...category
      };

      const updatedCategories = [...categories, newCategory];
      await saveCategories(updatedCategories);
      return true;
    } catch (error) {
      console.error('Add category error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new budget
  const addBudget = async (budget) => {
    setIsLoading(true);
    try {
      const newBudget = {
        id: generateId(),
        user_id: user?.id || 1,
        ...budget
      };

      // Get category name for the budget
      const category = categories.find(c => c.id === budget.category_id);
      if (category) {
        newBudget.category_name = category.name;
      }

      const updatedBudgets = [...budgets, newBudget];
      await saveBudgets(updatedBudgets);
      return true;
    } catch (error) {
      console.error('Add budget error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get expenses for a specific month
  const getMonthlyExpenses = (year, month) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  // Get monthly report data
  const getMonthlyReport = (year, month) => {
    const monthlyExpenses = getMonthlyExpenses(year, month);
    
    // Calculate totals by category
    const categoryTotals = {};
    let total = 0;

    monthlyExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      total += amount;

      const categoryId = expense.category_id;
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          category_id: categoryId,
          category_name: expense.category_name,
          total: 0
        };
      }

      categoryTotals[categoryId].total += amount;
    });

    return {
      year,
      month,
      total,
      categories: Object.values(categoryTotals)
    };
  };

  // Get current month's spending vs budget
  const getBudgetStatus = () => {
    const { startDate, endDate } = getCurrentMonthRange();
    
    // Filter expenses for current month
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Calculate spending by category
    const categorySpending = {};
    currentMonthExpenses.forEach(expense => {
      const categoryId = expense.category_id;
      if (!categorySpending[categoryId]) {
        categorySpending[categoryId] = 0;
      }
      categorySpending[categoryId] += parseFloat(expense.amount);
    });

    // Calculate budget status
    const budgetStatus = budgets.map(budget => {
      const spent = categorySpending[budget.category_id] || 0;
      const limit = parseFloat(budget.monthly_limit);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      return {
        ...budget,
        spent,
        remaining: Math.max(0, limit - spent),
        percentage: Math.min(percentage, 100),
        status: percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'good'
      };
    });

    return budgetStatus;
  };

  const value = {
    expenses,
    categories,
    budgets,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    addBudget,
    getMonthlyExpenses,
    getMonthlyReport,
    getBudgetStatus,
    refreshData: loadData
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};
