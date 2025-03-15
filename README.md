# Expense Tracker Mobile App

A React Native/Expo mobile application for tracking personal expenses on the go.

## Features

- **User Authentication**: Secure login and registration with local storage for user data
- **Expense Management**: Add, view, and categorize expenses
- **Budget Tracking**: Set monthly budgets by category and track spending against limits
- **Reports & Analytics**: View expense trends with beautiful charts and breakdowns
- **Offline Capability**: Full functionality without internet connection
- **Data Visualization**: Interactive charts for expense analysis
- **Mobile-Optimized UI**: Designed specifically for mobile use with touch interactions

## Tech Stack

- React Native
- Expo
- AsyncStorage for local data persistence
- React Navigation for screen management
- React Native Chart Kit for data visualization
- Context API for state management

## Project Structure

```
expense-tracker-mobile/
├── App.js                 # Main application entry point
├── app.json               # Expo configuration
├── assets/                # App icons and images
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.js # Authentication state management
│   │   └── ExpenseContext.js # Expense data management
│   ├── navigation/        # Navigation configuration
│   │   └── RootNavigator.js
│   ├── screens/           # App screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── AddExpenseScreen.js
│   │   ├── ReportsScreen.js
│   │   ├── BudgetScreen.js
│   │   └── SettingsScreen.js
│   └── utils/             # Utility functions
│       └── formatters.js  # Formatting helpers
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js
- Expo CLI
- Expo Go app on your mobile device for testing

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   expo start
   ```
4. Scan the QR code with your mobile device using the Expo Go app

## Usage

1. Create an account or use the demo credentials:
   - Username: demo
   - Password: password

2. Use the bottom tab navigation to access different parts of the app:
   - Dashboard: Overview of recent expenses and budget status
   - Add Expense: Record new expenses with category and date
   - Reports: View expense analytics and breakdowns
   - Budget: Set and monitor category spending limits
   - Settings: Configure app preferences and account

## Demo

The app includes a demo mode with sample data for testing all features without creating an account.

## Offline Usage

All data is stored locally on your device. Changes made while offline will be stored locally and don't require an internet connection.

## Future Enhancements

- Cloud synchronization for multi-device support
- Receipt scanning with photo recognition
- Recurring expense automation
- Export to spreadsheet functionality
- Multiple currency support
