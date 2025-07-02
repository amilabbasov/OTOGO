import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverNavigator from './DriverNavigator';
import ProviderNavigator from './ProviderNavigator';
import { useAuthStore } from '../stores/auth/authStore';
import { Routes } from './routes';

const MainStack = createNativeStackNavigator();

export const MainRouter = () => {
  const { userType, token, user } = useAuthStore();

  if (!token || !user) {
    console.warn('MainRouter: User not authenticated, redirecting to auth');
    return null;
  }

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {userType === 'driver' ? (
        <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
      ) : userType === 'provider' ? (
        <MainStack.Screen name={Routes.providerTabs} component={ProviderNavigator} />
      ) : (
        <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
      )}
    </MainStack.Navigator>
  );
};