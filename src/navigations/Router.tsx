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
  const { token, checkToken, userType, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkToken();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('FORCE_LOGOUT', () => {
      console.log('Force logout event received');
      clearAuth();
    });

    return () => subscription.remove();
  }, [clearAuth]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={defaultScreenOptions}
        >
          {!token ? (
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
  },
});

export default Router;