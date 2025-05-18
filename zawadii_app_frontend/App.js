// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Import Screens
import SplashScreen from './screens/SplashScreen';
import OnboardingStep1 from './screens/OnboardingStep1';
import OnboardingStep2 from './screens/OnboardingStep2';
import OnboardingStep3 from './screens/OnboardingStep3';
import SignupSuccess from './screens/SignupSuccess';
import EnterSignupCode from './screens/EnterSignupCode';

import ForgotPassword from './screens/ForgotPassword';

import PointsHistoryScreen from './screens/PointsHistoryScreen';
import PasswordChangeFailure from './screens/PasswordChangeFailure';
import PasswordChangeSuccess from './screens/PasswordChangeSuccess';
import ResetPassword from './screens/ResetPassword';
import RewardsScreen from './screens/RewardsScreen';
import ProfileScreen from './screens/ProfileScreen';
import Authentication from './screens/Authentication';
import InfoScreen from './screens/InfoScreen';
import EnterCode from './screens/EnterCode';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import Favourites from './screens/Favourites';
// import ScanScreen from './screens/ScanScreen';

// import PointsEarnedScreen from './screens/PointsEarnedScreen';

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