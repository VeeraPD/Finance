// src/styles/utils.js
import theme from './theme';

// Get category color based on category name
export const getCategoryColor = (categoryName) => {
  if (!categoryName) return theme.colors.primary;
  
  const normalizedName = categoryName.toLowerCase().trim();
  
  if (normalizedName.includes('food')) return theme.colors.categoryFood;
  if (normalizedName.includes('transport')) return theme.colors.categoryTransport;
  if (normalizedName.includes('entertainment')) return theme.colors.categoryEntertainment;
  if (normalizedName.includes('shopping')) return theme.colors.categoryShopping;
  if (normalizedName.includes('bill')) return theme.colors.categoryBills;
  if (normalizedName.includes('health')) return theme.colors.categoryHealth;
  if (normalizedName.includes('hous') || normalizedName.includes('rent')) return theme.colors.categoryHousing;
  if (normalizedName.includes('education')) return theme.colors.categoryEducation;
  if (normalizedName.includes('travel')) return theme.colors.categoryTravel;
  if (normalizedName.includes('personal')) return theme.colors.categoryPersonal;
  
  return theme.colors.categoryOther;
};

// Get color for progress bar or status based on percentage
export const getProgressColor = (percentage) => {
  if (percentage >= 90) return theme.colors.danger;
  if (percentage >= 75) return theme.colors.warning;
  return theme.colors.success;
};

// Create dynamic padding values
export const padding = (top, right, bottom, left) => {
  return {
    paddingTop: typeof top === 'string' ? theme.spacing[top] : top,
    paddingRight: typeof right === 'string' ? theme.spacing[right] : right,
    paddingBottom: typeof bottom === 'string' ? theme.spacing[bottom] : bottom,
    paddingLeft: typeof left === 'string' ? theme.spacing[left] : left,
  };
};

// Create dynamic margin values
export const margin = (top, right, bottom, left) => {
  return {
    marginTop: typeof top === 'string' ? theme.spacing[top] : top,
    marginRight: typeof right === 'string' ? theme.spacing[right] : right,
    marginBottom: typeof bottom === 'string' ? theme.spacing[bottom] : bottom,
    marginLeft: typeof left === 'string' ? theme.spacing[left] : left,
  };
};