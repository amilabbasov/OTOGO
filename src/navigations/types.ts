import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from './routes';
import { NavigatorScreenParams } from '@react-navigation/native';
import { UserType } from '../types/common';

export type RootStackParamList = {
  [Routes.auth]: NavigatorScreenParams<AuthStackParamList>;
  [Routes.main]: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
  [Routes.onboardingPager]: undefined;
  [Routes.login]: undefined;
  [Routes.register]: { userType: UserType | null; selectedServices?: string[] };
  [Routes.forgotPassword]: undefined;
  [Routes.otp]: { email: string; userType?: UserType; isPasswordReset?: boolean };
  [Routes.passwordResetOtp]: { email: string };
  [Routes.resetPassword]: { email: string; token: string };
};

export type MainStackParamList = {
  [Routes.personalInfo]: { email?: string; userType?: UserType };
  [Routes.serviceSelection]: { userType: UserType };
  [Routes.products]: { userType?: UserType };
  [Routes.branches]: { userType: UserType };
  [Routes.driverTabs]: undefined;
  [Routes.providerTabs]: undefined;
  [Routes.carSelection]: undefined;
  [Routes.selectedCarSummary]: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>; 

export type MainScreenProps<T extends keyof MainStackParamList> = 
  NativeStackScreenProps<MainStackParamList, T>;