import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerNavigator from './CustomerNavigator';
import ProviderNavigator from './ProviderNavigator';
import { useAuthStore } from '@stores/auth/authStore';

const MainStack = createNativeStackNavigator();

export const MainRouter = () => {
  const { userType } = useAuthStore();

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {userType === 'customer' ? (
        <MainStack.Screen name="CustomerTabs" component={CustomerNavigator} />
      ) : (
        <MainStack.Screen name="ProviderTabs" component={ProviderNavigator} />
      )}
    </MainStack.Navigator>
  );
};