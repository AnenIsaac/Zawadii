import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import Auth Screens
import Authentication from '../screens/auth/Authentication';
import ForgotPassword from '../screens/auth/ForgotPassword';
import ResetPassword from '../screens/auth/ResetPassword';
import EnterSignupCode from '../screens/auth/EnterSignupCode';
import SignupSuccess from '../screens/auth/SignupSuccess';
import LoginSuccessScreen from '../screens/auth/LoginSuccessScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Authentication" component={Authentication} />
      <Stack.Screen name="LoginSuccess" component={LoginSuccessScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="EnterSignupCode" component={EnterSignupCode} />
      <Stack.Screen name="SignupSuccess" component={SignupSuccess} />
    </Stack.Navigator>
  );
};

export default AuthStack;
