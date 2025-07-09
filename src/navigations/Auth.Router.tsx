import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/login/LoginScreen';
import RegisterScreen from '../screens/auth/register/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/forgot/ForgotPasswordScreen';
import OtpScreen from '../screens/auth/otp/OtpScreen';
import PasswordResetOtpScreen from '../screens/auth/otp/PasswordResetOtpScreen';
import ResetPasswordScreen from '../screens/auth/resetPassword/ResetPasswordScreen';
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
      <AuthStack.Screen name={Routes.passwordResetOtp} component={PasswordResetOtpScreen} />
      <AuthStack.Screen name={Routes.resetPassword} component={ResetPasswordScreen} />
      <AuthStack.Screen name={Routes.onboardingPager} component={OnboardingPagerScreen} />
    </AuthStack.Navigator>
  );
};