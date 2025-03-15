import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ReportsScreen from '../screens/ReportsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import auth context
import { useAuth } from '../contexts/AuthContext';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth navigator (for login/register)
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main app tab navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'AddExpense') {
          iconName = focused ? 'add-circle' : 'add-circle-outline';
        } else if (route.name === 'Reports') {
          iconName = focused ? 'bar-chart' : 'bar-chart-outline';
        } else if (route.name === 'Budget') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4f46e5',
      tabBarInactiveTintColor: 'gray',
      headerStyle: {
        backgroundColor: '#4f46e5',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ title: 'Home' }}
    />
    <Tab.Screen 
      name="AddExpense" 
      component={AddExpenseScreen} 
      options={{ title: 'Add Expense' }}
    />
    <Tab.Screen 
      name="Reports" 
      component={ReportsScreen} 
      options={{ title: 'Reports' }}
    />
    <Tab.Screen 
      name="Budget" 
      component={BudgetScreen} 
      options={{ title: 'Budget' }}
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ title: 'Settings' }}
    />
  </Tab.Navigator>
);

// Root navigator that handles auth state
const RootNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
