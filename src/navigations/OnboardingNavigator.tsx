import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UserTypeSelectionScreen from '@screens/auth/onboarding/UserTypeSelectionScreen';

const Stack = createStackNavigator();

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="UserTypeSelection" 
        component={UserTypeSelectionScreen} 
      />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator; 