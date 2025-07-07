import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverNavigator from './DriverNavigator';
import SoleProviderNavigator from './SoleProviderNavigator';
import CorporateProviderNavigator from './CorporateProviderNavigator';
import PersonalInfoScreen from '../screens/common/PersonalInfoScreen';
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
  
  const hasRequiredPersonalInfo = user && user.name && user.surname && user.birthday;

  if (!isAuthenticated && !pendingProfileCompletion.isPending) {
    console.warn('MainRouter: Unexpected state - not authenticated and no pending profile. This should be handled by Router.tsx');
    return null;
  }

  // If user is authenticated but missing required personal info, force Personal Info screen
  if (isAuthenticated && user && !hasRequiredPersonalInfo) {
    return (
      <MainStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={Routes.personalInfo}
      >
        <MainStack.Screen name={Routes.personalInfo} component={PersonalInfoScreen} />
      </MainStack.Navigator>
    );
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
          const hasRequiredPersonalInfo = user && user.name && user.surname && user.birthday;
          if (!hasRequiredPersonalInfo) {
            initialRouteName = Routes.personalInfo;
          } else if (pendingProfileCompletion.userType === 'driver') {
            initialRouteName = Routes.serviceSelection;
          } else {
            initialRouteName = Routes.products;
          }
      }
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

  let initialRouteName: string;
  try {
    initialRouteName = getInitialRouteForUserType(currentUserType);
  } catch (error) {
    console.error('MainRouter: Invalid user type, logging out user:', error);
    useAuthStore.getState().clearAuth();
    return null;
  }

  return (
    <MainStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      {currentUserType === 'driver' ? (
        <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
      ) : currentUserType === 'individual_provider' ? (
        <MainStack.Screen name={Routes.providerTabs} component={SoleProviderNavigator} />
      ) : currentUserType === 'company_provider' ? (
        <MainStack.Screen name={Routes.providerTabs} component={CorporateProviderNavigator} />
      ) : (
        <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
      )}
    </MainStack.Navigator>
  );
};

const getInitialRouteForUserType = (userType: UserType | null): string => {
  switch (userType) {
    case 'driver':
      return Routes.driverTabs;
    case 'individual_provider':
    case 'company_provider':
      return Routes.providerTabs;
    default:
      console.error('Invalid or null user type in getInitialRouteForUserType. UserType:', userType);
      throw new Error('Invalid user type for navigation');
  }
};