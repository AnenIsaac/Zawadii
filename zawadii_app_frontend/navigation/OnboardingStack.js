import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import Onboarding Screens
import OnboardingStep1 from '../screens/onboarding/OnboardingStep1';
import OnboardingStep2 from '../screens/onboarding/OnboardingStep2';
import OnboardingStep3 from '../screens/onboarding/OnboardingStep3';

const Stack = createStackNavigator();

const OnboardingStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: true, gestureDirection: 'horizontal' }}>
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2} />
      <Stack.Screen name="OnboardingStep3" component={OnboardingStep3} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
