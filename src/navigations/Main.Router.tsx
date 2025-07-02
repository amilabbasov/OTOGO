import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverNavigator from './DriverNavigator';
import ProviderNavigator from './ProviderNavigator';
import { useAuthStore } from '../stores/auth/authStore';
import { Routes } from './routes';

const MainStack = createNativeStackNavigator();

export const MainRouter = () => {
  const { userType } = useAuthStore();

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {userType === 'driver' ? (
        <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
      ) : (
        <MainStack.Screen name={Routes.providerTabs} component={ProviderNavigator} />
      )}
    </MainStack.Navigator>
  );
};