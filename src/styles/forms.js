// src/styles/forms.js
import { StyleSheet } from 'react-native';
import theme from './theme';

export default StyleSheet.create({
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.input,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.gray800,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.input,
    paddingHorizontal: theme.spacing.md,
  },
  amountInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.gray800,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.input,
    padding: theme.spacing.md,
  },
});