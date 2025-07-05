import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import { MainRouter } from './Main.Router';
import { AuthRouter } from './Auth.Router';
import { defaultScreenOptions } from '../configs/navigationConfig';
import { I18nextProvider } from 'react-i18next';
import i18n from '../locales/i18n';
import { useAuthStore } from '../stores/auth/authStore';
import { Routes } from './routes';
import { RootStackParamList } from './types';
import { UserType } from '../types/common';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const Router = () => {
  const [authState, setAuthState] = useState({
    token: null as string | null,
    userType: null as UserType | null,
    isAppReady: false,
    pendingProfileCompletion: null as any
  });

  const checkToken = useAuthStore(state => state.checkToken);
  const clearAuth = useAuthStore(state => state.clearAuth);

  useEffect(() => {
    // Subscribe to auth store changes for a reactive update
    const unsubscribe = useAuthStore.subscribe((state) => {
      console.log('🔄 AuthStore state changed:', {
        token: state.token ? `Token: ${state.token.substring(0, 20)}...` : 'No Token',
        userType: state.userType,
        isLoading: state.isLoading,
        pendingProfileCompletion: state.pendingProfileCompletion,
        timestamp: new Date().toISOString()
      });
      
      setAuthState(prevAuthState => ({
        ...prevAuthState,
        token: state.token,
        userType: state.userType,
        pendingProfileCompletion: state.pendingProfileCompletion,
      }));
    });

    // Initial state check
    const currentState = useAuthStore.getState();
    setAuthState({
      token: currentState.token,
      userType: currentState.userType,
      isAppReady: false,
      pendingProfileCompletion: currentState.pendingProfileCompletion
    });
    console.log('🚀 Router mounted. Initial AuthStore state:', {
      token: currentState.token ? 'Present' : 'Absent',
      userType: currentState.userType,
      pendingProfileCompletion: currentState.pendingProfileCompletion ? 'Present' : 'Absent'
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const init = async () => {
      console.log('🔧 Initializing app: Checking token and setting app ready state...');
      await checkToken();
      setAuthState(prevAuthState => ({ ...prevAuthState, isAppReady: true }));
      console.log('✅ App ready. Final AuthState token:', useAuthStore.getState().token ? 'Present' : 'Absent');
    };
    init();
  }, [checkToken]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('FORCE_LOGOUT', () => {
      console.warn('🚨 FORCE_LOGOUT event received. Clearing auth...');
      clearAuth();
    });
    return () => subscription.remove();
  }, [clearAuth]);

  if (!authState.isAppReady) {
    console.log('⏳ App is not ready. Showing loading indicator.');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log('🎯 RootNavigator render.', {
    tokenStatus: authState.token ? 'Authenticated' : 'Unauthenticated',
    userType: authState.userType,
    pendingProfile: authState.pendingProfileCompletion,
    shouldShowMainRouter: authState.token || authState.pendingProfileCompletion
  });

  // Allow access to MainRouter if user has token OR if profile completion is pending
  const shouldShowMainRouter = authState.token || authState.pendingProfileCompletion;

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={defaultScreenOptions}
        >
          {!shouldShowMainRouter ? (
            <>
              {console.log('🔐 Rendering AuthRouter: User is NOT authenticated and no pending profile completion.')}
              <RootStack.Screen
                name={Routes.auth}
                component={AuthRouter}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <>
              {console.log('🏠 Rendering MainRouter: User IS authenticated OR has pending profile completion.')}
              <RootStack.Screen
                name={Routes.main}
                component={MainRouter}
                options={{ headerShown: false }}
              />
            </>
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
    backgroundColor: '#fff', // Fon rəngi əlavə etdim
  },
});

export default Router;