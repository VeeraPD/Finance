// src/styles/typography.js
import { StyleSheet } from 'react-native';
import theme from './theme';

export default StyleSheet.create({
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.gray800,
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.gray800,
    marginBottom: theme.spacing.md,
  },
  body: {
    fontSize: theme.typography.fontSizes.base,
    color: theme.colors.gray700,
    lineHeight: theme.typography.lineHeights.normal,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.gray600,
    marginBottom: theme.spacing.sm,
  },
  caption: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.gray500,
  },
  error: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
});