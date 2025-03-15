/**
 * Utility functions for formatting data in the Expense Tracker app
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {object} options - Date formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Group expenses by category
 * @param {Array} expenses - List of expense objects
 * @returns {Object} Object with category IDs as keys and arrays of expenses as values
 */
export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((grouped, expense) => {
    const categoryId = expense.category_id;
    
    if (!grouped[categoryId]) {
      grouped[categoryId] = [];
    }
    
    grouped[categoryId].push(expense);
    return grouped;
  }, {});
};

/**
 * Group expenses by month
 * @param {Array} expenses - List of expense objects
 * @returns {Object} Object with month-year strings as keys and arrays of expenses as values
 */
export const groupExpensesByMonth = (expenses) => {
  return expenses.reduce((grouped, expense) => {
    const date = new Date(expense.date);
    const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(expense);
    return grouped;
  }, {});
};

/**
 * Calculate total expenses
 * @param {Array} expenses - List of expense objects
 * @returns {number} Total amount
 */
export const calculateTotal = (expenses) => {
  return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
};

/**
 * Generate chart colors
 * @param {number} count - Number of colors needed
 * @returns {Array} Array of color strings
 */
export const generateChartColors = (count) => {
  const baseColors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316'  // Orange
  ];
  
  // If we need more colors than we have in the base array, cycle through them
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};
