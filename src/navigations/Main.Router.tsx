import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerNavigator from './CustomerNavigator';
import ProviderNavigator from './ProviderNavigator';
import { useAuthStore } from '../stores/auth/authStore';
import { Routes } from './routes';

const MainStack = createNativeStackNavigator();

export const MainRouter = () => {
  const { userType } = useAuthStore();

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {userType === 'driver' ? (
        <MainStack.Screen name={Routes.customerTabs} component={CustomerNavigator} />
      ) : (
        <MainStack.Screen name={Routes.providerTabs} component={ProviderNavigator} />
      )}
    </MainStack.Navigator>
  );
};