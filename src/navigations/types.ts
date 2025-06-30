import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from './routes';

// Navigation param lists using the single Routes enum
export type RootStackParamList = {
  [Routes.onboarding]: undefined;
  [Routes.auth]: undefined;
  [Routes.main]: undefined;
};

export type OnboardingStackParamList = {
  [Routes.changeLanguage]: undefined;
  [Routes.onboardingPager]: undefined;
};

export type AuthStackParamList = {
  [Routes.login]: undefined;
  [Routes.register]: undefined;
  [Routes.forgotPassword]: undefined;
  [Routes.otp]: undefined;
};

export type MainStackParamList = {
  [Routes.customerTabs]: undefined;
  [Routes.providerTabs]: undefined;
};

// Screen props for current navigation
export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> = 
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>; 