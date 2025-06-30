/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import OnboardingNavigator from './src/navigations/OnboardingNavigator';
import { StatusBar } from 'react-native';
import './src/locales/i18n';

function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <OnboardingNavigator />
    </NavigationContainer>
  );
}

export default App;
