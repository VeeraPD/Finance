import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
// Add new imports
import { theme, layout, typography } from '../styles';
import { Button, Input } from '../components/ui';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    // Validate form
    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const success = await register({ username, email, password });
    if (success) {
      // Registration successful, navigate to login
      navigation.navigate('Login');
    }
  };

  return (
  <SafeAreaView style={layout.container}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={typography.title}>Create Account</Text>
          <Text style={typography.body}>Sign up to track your expenses</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Choose a username"
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Your email address"
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Create a password"
          />
          
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm your password"
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            style={{marginBottom: theme.spacing.md}}
          />

          <Button
            title="Already have an account? Login"
            onPress={() => navigation.navigate('Login')}
            type="secondary"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: theme.spacing.xxxl,
    marginBottom: theme.spacing.xl,
  },
  formContainer: {
    width: '100%',
  },
});

export default RegisterScreen;
