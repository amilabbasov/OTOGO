import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/login/LoginScreen';
import RegisterScreen from '../screens/auth/register/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/forgot/ForgotPasswordScreen';
import OtpScreen from '../screens/auth/otp/OtpScreen';
import PersonalInfoScreen from '../screens/auth/personalInfo/PersonalInfoScreen';
import OnboardingPagerScreen from '../screens/auth/onboarding/OnboardingPagerScreen';
import { Routes } from './routes';
import { AuthStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export const AuthRouter = () => {
  return (
    <AuthStack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={Routes.login}
    >
      <AuthStack.Screen name={Routes.login} component={LoginScreen} />
      <AuthStack.Screen name={Routes.register} component={RegisterScreen} />
      <AuthStack.Screen name={Routes.forgotPassword} component={ForgotPasswordScreen} />
      <AuthStack.Screen name={Routes.otp} component={OtpScreen} />
      <AuthStack.Screen name={Routes.personalInfo} component={PersonalInfoScreen} />
      <AuthStack.Screen name={Routes.onboardingPager} component={OnboardingPagerScreen} />
    </AuthStack.Navigator>
  );
};