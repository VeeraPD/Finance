import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import contexts
import { AuthProvider } from './src/contexts/AuthContext';
import { ExpenseProvider } from './src/contexts/ExpenseContext';

// Import navigation
import RootNavigator from './src/navigation/RootNavigator';

// Main App component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Check for existing authentication token on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.error('Failed to load auth token from storage', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    // We could show a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider initialToken={userToken}>
        <ExpenseProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </ExpenseProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
