import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import type { OnboardingStackParamList } from './types';
import ChangeLanguageScreen from '../screens/auth/onboarding/ChangeLanguageScreen';
import OnboardingPagerScreen from '../screens/auth/onboarding/OnboardingPagerScreen';
import { Routes } from './routes';

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={Routes.changeLanguage}
    >
      <Stack.Screen 
        name={Routes.changeLanguage} 
        component={ChangeLanguageScreen} 
      />
      <Stack.Screen 
        name={Routes.onboardingPager} 
        component={OnboardingPagerScreen} 
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator; 