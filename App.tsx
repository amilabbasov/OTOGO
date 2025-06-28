/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from './src/screens/auth/onboarding/OnboardingScreen';
import UserTypeSelectionScreen from './src/screens/auth/onboarding/UserTypeSelectionScreen';
import { StatusBar } from 'react-native';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
