import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Routes } from './routes';
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  [Routes.auth]: NavigatorScreenParams<AuthStackParamList>;
  [Routes.main]: NavigatorScreenParams<MainStackParamList>;
};

export type AuthStackParamList = {
  [Routes.changeLanguage]: undefined;
  [Routes.onboardingPager]: undefined;
  [Routes.login]: undefined;
  [Routes.register]: { userType: string | null };
  [Routes.forgotPassword]: undefined;
  [Routes.otp]: undefined;
};

export type MainStackParamList = {
  [Routes.customerTabs]: undefined;
  [Routes.providerTabs]: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>; 

export type MainScreenProps<T extends keyof MainStackParamList> = 
  NativeStackScreenProps<MainStackParamList, T>;