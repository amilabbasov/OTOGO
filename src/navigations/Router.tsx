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

const RootStack = createNativeStackNavigator<RootStackParamList>();

const Router = () => {
  const [authState, setAuthState] = useState({
    token: null as string | null,
    userType: null as 'driver' | 'provider' | null,
    isAppReady: false 
  });

  const checkToken = useAuthStore(state => state.checkToken);
  const clearAuth = useAuthStore(state => state.clearAuth);

  useEffect(() => {
    const currentState = useAuthStore.getState();
    setAuthState({
      token: currentState.token,
      userType: currentState.userType,
      isAppReady: false
    });

    const unsubscribe = useAuthStore.subscribe((state) => {
      setAuthState(prevAuthState => ({
        ...prevAuthState, 
        token: state.token,
        userType: state.userType,
      }));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkToken();
      setAuthState(prevAuthState => ({ ...prevAuthState, isAppReady: true }));
    };
    init();
  }, [checkToken]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('FORCE_LOGOUT', () => {
      console.log('Force logout event received');
      clearAuth();
    });

    return () => subscription.remove();
  }, [clearAuth]);

  if (!authState.isAppReady) { 
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={defaultScreenOptions}
        >
          {!authState.token ? (
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
    backgroundColor: '#fff', // Fon rəngi əlavə etdim
  },
});

export default Router;