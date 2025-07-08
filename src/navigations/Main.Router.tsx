import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PersonalInfoScreen from '../screens/common/PersonalInfoScreen';
import MainAppScreen from '../screens/common/MainAppScreen';
import CarSelectionScreen from '../screens/driver/carSelection/CarSelectionScreen';
import SelectServicesScreen from '..//screens/common/SelectServicesScreen';
import ProductsScreen from '../screens/common/ProductsScreen';
import BranchesScreen from '../screens/common/BranchesScreen';
import UserTypeSelectionScreen from '../screens/auth/onboarding/flow/UserTypeSelectionScreen';
import OtpScreen from '../screens/auth/otp/OtpScreen';
import useAuthStore from '../stores/auth/authStore';
import { Routes } from './routes';
import { UserType } from '../types/common';

const MainStack = createNativeStackNavigator();

export const MainRouter = () => {
  const {
    userType: storeUserType,
    token,
    user,
    pendingProfileCompletion,
    setPendingProfileCompletionState,
    isAuthenticated
  } = useAuthStore();

  const currentUserType: UserType | null = storeUserType || pendingProfileCompletion.userType;

  if (!isAuthenticated && !pendingProfileCompletion.isPending) {
    console.warn('MainRouter: Unexpected state - not authenticated and no pending profile. This should be handled by Router.tsx');
    return null;
  }

  // If user is authenticated and has basic info, show main app directly
  if (isAuthenticated && !pendingProfileCompletion.isPending) {
    return <MainAppScreen />;
  }

  if (pendingProfileCompletion.isPending && !pendingProfileCompletion.userType) {
    return (
      <MainStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={Routes.userTypeSelection}
      >
        <MainStack.Screen
          name={Routes.userTypeSelection}
          children={() => (
            <UserTypeSelectionScreen
              onNext={(selectedUserType: string) => {
                const userTypeMap: { [key: string]: UserType } = {
                  'driver': 'driver',
                  'individual_provider': 'individual_provider',
                  'company_provider': 'company_provider'
                };
                const mappedUserType = userTypeMap[selectedUserType] || 'driver';
                setPendingProfileCompletionState({
                  ...pendingProfileCompletion,
                  userType: mappedUserType,
                });
              }}
            />
          )}
        />
      </MainStack.Navigator>
    );
  }

  if (pendingProfileCompletion.isPending) {
    let initialRouteName = Routes.otp;

    if (isAuthenticated && token && user) {
      // If user is authenticated (logged in) and we have pending profile completion,
      // it means they need to complete their profile information
      switch (pendingProfileCompletion.step) {
        case 'personalInfo':
          initialRouteName = Routes.personalInfo;
          break;
        case 'serviceSelection':
          initialRouteName = Routes.serviceSelection;
          break;
        case 'products':
          initialRouteName = Routes.products;
          break;
        case 'branches':
          initialRouteName = Routes.branches;
          break;
        default:
          // For corporate providers: company name and phone
          // For other user types: name and surname
          const hasBasicInfo = currentUserType === 'company_provider' 
            ? (user && user.companyName && user.phone)
            : (user && user.name && user.surname);

          if (!hasBasicInfo) {
            initialRouteName = Routes.personalInfo;
          } else if (pendingProfileCompletion.userType === 'driver') {
            initialRouteName = Routes.serviceSelection;
          } else {
            initialRouteName = Routes.products;
          }
      }
    } else if (!isAuthenticated && pendingProfileCompletion.isPending) {
      // If user is not authenticated but has pending profile completion,
      // it means they are in registration flow and need OTP verification
      initialRouteName = Routes.otp;
    }

    return (
      <MainStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName}
      >
        <MainStack.Screen name={Routes.otp} component={OtpScreen} />
        <MainStack.Screen name={Routes.personalInfo} component={PersonalInfoScreen} />
        <MainStack.Screen
          name={Routes.serviceSelection}
          children={() => {
            const userType = pendingProfileCompletion.userType;
            if (userType === 'driver') {
              return <CarSelectionScreen />;
            }
            return <SelectServicesScreen />;
          }}
        />
        <MainStack.Screen name={Routes.products} component={ProductsScreen} />
        <MainStack.Screen name={Routes.branches} component={BranchesScreen} />
      </MainStack.Navigator>
    );
  }

  // Fallback - should not reach here
  console.warn('MainRouter: Unexpected state, defaulting to auth');
  return null;
};