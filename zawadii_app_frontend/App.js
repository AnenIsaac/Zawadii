// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Import Navigators
import AuthStack from './navigation/AuthStack';
import MainTabs from './navigation/MainTabs';
import OnboardingStack from './navigation/OnboardingStack';

// Import Screens
import SplashScreen from './screens/SplashScreen';
import PasswordChangeFailure from './screens/user/PasswordChangeFailure';
import PasswordChangeSuccess from './screens/user/PasswordChangeSuccess';
import ResetPassword from './screens/auth/ResetPassword';

import PointsHistoryScreen from './screens/user/PointsHistoryScreen';

import NotificationsScreen from './screens/main/NotificationsScreen';
import EnterCode from './screens/main/EnterCode';
import InfoScreen from './screens/main/InfoScreen';
import ValidTRAReceiptScreen from './screens/ValidTRAReceipt'; // Import the screen

// import PointsEarnedScreen from './screens/user/PointsEarnedScreen'; // Assuming PointsEarnedScreen is user-specific

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Stack.Navigator 
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* Screens not part of Auth or MainTabs stacks, or used across stacks */}
        <Stack.Screen name="PasswordChangeFailure" component={PasswordChangeFailure} />
        <Stack.Screen name="PasswordChangeSuccess" component={PasswordChangeSuccess} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="PointsHistoryScreen" component={PointsHistoryScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="EnterCode" component={EnterCode} />
        <Stack.Screen name="InfoScreen" component={InfoScreen} />
        
        {/* Add ValidTRAReceiptScreen as a screen in this top-level AppStack */}
        {/* This allows navigation from any screen within MainTabs (or other stacks) */}
        <Stack.Screen 
          name="ValidTRAReceipt" 
          component={ValidTRAReceiptScreen} 
          options={{ 
            headerShown: true, 
            title: 'Confirm Receipt Details',
            // Optional: Customize header style, back button behavior
            // headerBackTitle: 'Scan', 
          }} 
        />
        
        {/* <Stack.Screen name="PointsEarnedScreen" component={PointsEarnedScreen} /> */}

      </Stack.Navigator>
    </NavigationContainer>
  );
}