import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Mock API for authentication (replace with real API integration later)
const mockLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      if (username === 'demo' && password === 'password') {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'demo',
            email: 'demo@example.com'
          }
        });
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, 1000);
  });
};

// Auth provider component
export const AuthProvider = ({ children, initialToken = null }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);

  // Set user from token if available on mount
  useEffect(() => {
    if (token) {
      // In a real app, you would decode the JWT or make a request
      // to get the user details from the token
      setUser({
        id: 1,
        username: 'demo',
        email: 'demo@example.com'
      });
    }
  }, [token]);

  // Login function
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await mockLogin(username, password);
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('userToken', response.token);
      
      // Update state
      setToken(response.token);
      setUser(response.user);
      
      return true;
    } catch (error) {
      Alert.alert('Login Failed', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function (mock)
  const register = async (userData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Registration successful! Please login.');
      return true;
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Remove token from storage
      await AsyncStorage.removeItem('userToken');
      
      // Clear state
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
