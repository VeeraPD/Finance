// src/components/ui/Button.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { buttons, theme } from '../../styles';

const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  isLoading = false, 
  disabled = false,
  style,
  textStyle,
  ...props 
}) => {
  // Determine button style based on type
  const getButtonStyle = () => {
    switch (type) {
      case 'secondary':
        return buttons.secondaryButton;
      case 'danger':
        return buttons.dangerButton;
      case 'primary':
      default:
        return buttons.primaryButton;
    }
  };
  
  // Determine text style based on type
  const getTextStyle = () => {
    switch (type) {
      case 'secondary':
        return buttons.secondaryButtonText;
      case 'danger':
        return buttons.dangerButtonText;
      case 'primary':
      default:
        return buttons.primaryButtonText;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && { opacity: 0.6 },
        style
      ]}
      onPress={onPress}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={type === 'secondary' ? theme.colors.primary : theme.colors.white} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;