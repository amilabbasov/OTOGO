import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import { MainRouter } from './Main.Router';
import { AuthRouter } from './Auth.Router';
import { defaultScreenOptions } from '../configs/navigationConfig';
import { I18nextProvider } from 'react-i18next';
import i18n from '../locales/i18n';
import useAuthStore from '../stores/auth/authStore';
import { Routes } from './routes';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const Router = () => {
  const { 
    isAuthenticated, 
    userType, 
    isLoading: isAuthLoading,
    token,
    pendingProfileCompletion,
    initializeAuth,
    clearAuth
  } = useAuthStore();

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      await initializeAuth();
      setIsAppReady(true);
    };
    initApp();
  }, [initializeAuth]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('FORCE_LOGOUT', () => {
      clearAuth();
    });
    return () => subscription.remove();
  }, [clearAuth]);

  if (!isAppReady || isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const shouldShowMainRouter = isAuthenticated || pendingProfileCompletion.isPending;

  console.log('Router: Navigation state:', {
    isAuthenticated,
    userType,
    isAuthLoading,
    hasToken: !!token,
    pendingProfileCompletion: pendingProfileCompletion.isPending,
    shouldShowMainRouter
  });
  
  console.log('Router: pendingProfileCompletion details:', {
    isPending: pendingProfileCompletion.isPending,
    userType: pendingProfileCompletion.userType,
    email: pendingProfileCompletion.email,
    step: pendingProfileCompletion.step
  });

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={defaultScreenOptions}
        >
          {!shouldShowMainRouter ? (
            <RootStack.Screen
              name={Routes.auth}
              component={AuthRouter}
              options={{ headerShown: false }}
            />
          ) : (
            <RootStack.Screen
              name={Routes.main}
              component={MainRouter}
              options={{ headerShown: false }}
            />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default Router;