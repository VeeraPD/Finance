// src/styles/theme.js

const colors = {
  // Primary colors
  primary: '#4F46E5',      // Indigo
  primaryLight: '#818CF8', // Lighter indigo
  primaryDark: '#3730A3',  // Darker indigo
  
  // Secondary colors
  success: '#10B981',      // Emerald
  warning: '#F59E0B',      // Amber
  danger: '#EF4444',       // Red
  info: '#06B6D4',         // Cyan
  
  // Category colors
  categoryFood: '#10B981',        // Green
  categoryTransport: '#3B82F6',   // Blue  
  categoryEntertainment: '#8B5CF6', // Purple
  categoryShopping: '#F59E0B',    // Amber
  categoryBills: '#EF4444',       // Red
  categoryHealth: '#EC4899',      // Pink
  categoryHousing: '#F97316',     // Orange
  categoryEducation: '#06B6D4',   // Cyan
  categoryTravel: '#14B8A6',      // Teal
  categoryPersonal: '#6366F1',    // Indigo
  categoryOther: '#64748B',       // Slate
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  
  // Transparent colors for overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Standard paddings
  screenPadding: 16,
  cardPadding: 16,
  
  // Margins
  sectionMargin: 20,
  cardMargin: 12,
};

const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
  
  // Specific component radiuses
  card: 12,
  button: 8,
  input: 8,
};

const typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};