import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverNavigator from './DriverNavigator';
import SoleProviderNavigator from './SoleProviderNavigator';
import CorporateProviderNavigator from './CorporateProviderNavigator';
import PersonalInfoScreen from '../screens/common/PersonalInfoScreen';
import CarSelectionScreen from '../screens/common/CarSelectionScreen';
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
  
  console.log('MainRouter render. Current UserType:', currentUserType, 'Store UserType:', storeUserType, 'Token present:', !!token, 'User:', user?.email, 'Pending Profile:', pendingProfileCompletion.isPending, 'Pending UserType:', pendingProfileCompletion.userType);

  // Allow access to MainRouter if user is authenticated OR has pending profile completion
  if (!isAuthenticated && !pendingProfileCompletion.isPending) {
    console.warn('MainRouter: Unexpected state - not authenticated and no pending profile. This should be handled by Router.tsx');
    return null;
  }

  if (pendingProfileCompletion.isPending && !pendingProfileCompletion.userType) {
    console.log('MainRouter: Pending profile completion and no userType selected yet. Showing UserType selection.');
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
                console.log('User selected userType:', selectedUserType, 'mapped to:', mappedUserType);
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
    console.log('MainRouter: User has pending profile completion. Showing OTP, Personal Info, Car Selection, Products, and Branches screens.');
    console.log('MainRouter: Current state:', {
      isAuthenticated,
      token: !!token,
      user: user?.email,
      pendingProfileCompletion
    });
    
    // Determine the initial route based on authentication status
    let initialRouteName = Routes.otp;
    if (isAuthenticated && token && user) {
      // User is authenticated, they should be on personal info screen
      initialRouteName = Routes.personalInfo;
    }
    
    return (
      <MainStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName}
      >
        <MainStack.Screen name={Routes.otp} component={OtpScreen} />
        <MainStack.Screen name={Routes.personalInfo} component={PersonalInfoScreen} />
        <MainStack.Screen name={Routes.carSelection} component={CarSelectionScreen} />
        <MainStack.Screen name={Routes.products} component={ProductsScreen} />
        <MainStack.Screen name={Routes.branches} component={BranchesScreen} />
      </MainStack.Navigator>
    );
  }

  // User is fully authenticated, show appropriate navigator
  let initialRouteName: string;
  try {
    initialRouteName = getInitialRouteForUserType(currentUserType);
    console.log('MainRouter: User is fully authenticated. Decided initial route name:', initialRouteName);
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
        <>
          {console.log('MainRouter: User is DRIVER. Rendering DriverNavigator.')}
          <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
        </>
      ) : currentUserType === 'individual_provider' ? (
        <>
          {console.log('MainRouter: User is INDIVIDUAL_PROVIDER. Rendering SoleProviderNavigator.')}
          <MainStack.Screen name={Routes.providerTabs} component={SoleProviderNavigator} />
        </>
      ) : currentUserType === 'company_provider' ? (
        <>
          {console.log('MainRouter: User is COMPANY_PROVIDER. Rendering CorporateProviderNavigator.')}
          <MainStack.Screen name={Routes.providerTabs} component={CorporateProviderNavigator} />
        </>
      ) : (
        <>
          {console.warn('MainRouter: Unknown or null user type. Defaulting to DriverNavigator.', currentUserType)}
          <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
        </>
      )}
    </MainStack.Navigator>
  );
};

const getInitialRouteForUserType = (userType: UserType | null): string => {
  console.log('getInitialRouteForUserType called with:', userType);
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