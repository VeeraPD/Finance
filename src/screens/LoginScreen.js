import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
// Theme imports
import { theme, layout, typography } from '../styles';
import { Button, Input } from '../components/ui';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // This fixes the hidePassword is not defined error
  const [hidePassword, setHidePassword] = useState(true);
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }
    
    const success = await login(username, password);
    if (!success) {
      setPassword('');
    }
  };

  const handleDemoLogin = async () => {
    setUsername('demo');
    setPassword('password');
    
    // Add slight delay to show the user what's happening
    setTimeout(async () => {
      await login('demo', 'password');
    }, 500);
  };

  return (
    <SafeAreaView style={layout.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={layout.scrollContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet-outline" size={100} color={theme.colors.primary} />
            <Text style={typography.title}>Expense Tracker</Text>
            <Text style={[typography.body, styles.tagline]}>Manage your finances on the go</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Username"
              leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.gray500} style={{marginRight: theme.spacing.sm}} />}
            />
            
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              placeholder="Password"
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.gray500} style={{marginRight: theme.spacing.sm}} />}
              rightIcon={
                <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                  <Ionicons 
                    name={hidePassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={theme.colors.gray500}
                  />
                </TouchableOpacity>
              }
            />

            <Button
              title="Login"
              onPress={handleLogin}
              isLoading={isLoading}
              style={{marginBottom: theme.spacing.md}}
            />

            <Button
              title="Try Demo Account"
              onPress={handleDemoLogin}
              type="secondary"
              style={{marginBottom: theme.spacing.xl}}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Create Account"
              onPress={() => navigation.navigate('Register')}
              type="secondary"
              style={{marginTop: theme.spacing.md}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  tagline: {
    color: theme.colors.gray500,
    marginTop: theme.spacing.xs,
  },
  formContainer: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray200,
  },
  dividerText: {
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.gray500,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default LoginScreen;