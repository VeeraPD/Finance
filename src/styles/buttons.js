// src/styles/buttons.js
import { StyleSheet } from 'react-native';
import theme from './theme';

export default StyleSheet.create({
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  dangerButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.button,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  iconButton: {
    padding: theme.spacing.md,
  },
});