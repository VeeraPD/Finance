// src/components/ui/Input.js
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { forms, typography, theme } from '../../styles';

const Input = ({ 
  label, 
  error, 
  leftIcon, 
  rightIcon,
  style,
  inputStyle,
  ...props 
}) => {
  return (
    <View style={forms.inputGroup}>
      {label && <Text style={typography.label}>{label}</Text>}
      
      {leftIcon || rightIcon ? (
        <View style={forms.inputWithIcon}>
          {leftIcon}
          <TextInput
            style={[
              { flex: 1, padding: theme.spacing.md },
              inputStyle
            ]}
            placeholderTextColor={theme.colors.gray400}
            {...props}
          />
          {rightIcon}
        </View>
      ) : (
        <TextInput
          style={[forms.input, inputStyle]}
          placeholderTextColor={theme.colors.gray400}
          {...props}
        />
      )}
      
      {error && <Text style={typography.error}>{error}</Text>}
    </View>
  );
};

export default Input;