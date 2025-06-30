/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import './src/locales/i18n';
import { AuthRouter } from './src/navigations/Auth.Router';

function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <AuthRouter />
    </NavigationContainer>
  );
}

export default App;