// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Import Screens
import SplashScreen from './screens/SplashScreen'; // Keep as is or move to a 'common' or 'root' folder if preferred
import OnboardingStep1 from './screens/onboarding/OnboardingStep1';
import OnboardingStep2 from './screens/onboarding/OnboardingStep2';
import OnboardingStep3 from './screens/onboarding/OnboardingStep3';
import SignupSuccess from './screens/auth/SignupSuccess';
import EnterSignupCode from './screens/auth/EnterSignupCode';
import Authentication from './screens/auth/Authentication';
import ForgotPassword from './screens/auth/ForgotPassword';
import ResetPassword from './screens/auth/ResetPassword';

import PointsHistoryScreen from './screens/user/PointsHistoryScreen';
import PasswordChangeFailure from './screens/user/PasswordChangeFailure';
import PasswordChangeSuccess from './screens/user/PasswordChangeSuccess';

import RewardsScreen from './screens/main/RewardsScreen';
import ProfileScreen from './screens/main/ProfileScreen';
import InfoScreen from './screens/main/InfoScreen';
import EnterCode from './screens/main/EnterCode';
import HomeScreen from './screens/main/HomeScreen';
import SearchScreen from './screens/main/SearchScreen';
import NotificationsScreen from './screens/main/NotificationsScreen';
import Favourites from './screens/main/Favourites';
// import ScanScreen from './screens/main/ScanScreen'; // Assuming ScanScreen is part of main functionality

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
          gestureEnabled: true, // Enable swipe gesture
          gestureDirection: 'horizontal', // Direction of swipe
        }}
      >
      
        <Stack.Screen name="SplashScreen" component={SplashScreen}  />
        <Stack.Screen name="OnboardingStep1" component={OnboardingStep1} options={{ gestureEnabled: true }} />
        <Stack.Screen name="OnboardingStep2" component={OnboardingStep2} options={{ gestureEnabled: true }}/>
        <Stack.Screen name="OnboardingStep3" component={OnboardingStep3} options={{ gestureEnabled: true }}/>
        <Stack.Screen name="SignupSuccess" component={SignupSuccess} />
        <Stack.Screen name="EnterSignupCode" component={EnterSignupCode} />
        
        <Stack.Screen name="Authentication" component={Authentication}  />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
  
        <Stack.Screen name="PasswordChangeFailure" component={PasswordChangeFailure} />
        <Stack.Screen name="PasswordChangeSuccess" component={PasswordChangeSuccess}  />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="RewardsScreen" component={RewardsScreen} />
         <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="EnterCode" component={EnterCode} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="InfoScreen" component={InfoScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="Favourites" component={Favourites} />
        <Stack.Screen name="PointsHistoryScreen" component={PointsHistoryScreen} />
        {/* <Stack.Screen name="PointsEarnedScreen" component={PointsEarnedScreen} /> */}
        {/* <Stack.Screen name="ScanScreen" component={ScanScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}