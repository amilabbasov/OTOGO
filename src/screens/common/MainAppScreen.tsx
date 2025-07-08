import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverNavigator from '../../navigations/DriverNavigator';
import SoleProviderNavigator from '../../navigations/SoleProviderNavigator';
import CorporateProviderNavigator from '../../navigations/CorporateProviderNavigator';
import PersonalInfoScreen from './PersonalInfoScreen';
import useAuthStore from '../../stores/auth/authStore';
import { Routes } from '../../navigations/routes';
import { UserType } from '../../types/common';

const MainAppStack = createNativeStackNavigator();

const MainAppScreen = () => {
  const { 
    userType: storeUserType, 
    user, 
    pendingProfileCompletion
  } = useAuthStore();
  
  const currentUserType: UserType | null = storeUserType || pendingProfileCompletion.userType;
  
  // Check if user has at least basic information
  // For corporate providers: company name and phone
  // For other user types: name and surname
  const hasBasicInfo = currentUserType === 'company_provider' 
    ? (user && user.companyName && user.phone)
    : (user && user.name && user.surname);

  // Only show personal info screen if user has no basic information at all
  if (!hasBasicInfo) {
    return (
      <MainAppStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={Routes.personalInfo}
      >
        <MainAppStack.Screen name={Routes.personalInfo} component={PersonalInfoScreen} />
      </MainAppStack.Navigator>
    );
  }

  // If user has all required info, show main app based on user type
  const getInitialRouteForUserType = (userType: UserType | null): string => {
    switch (userType) {
      case 'driver':
        return Routes.driverTabs;
      case 'individual_provider':
      case 'company_provider':
        return Routes.providerTabs;
      default:
        console.error('Invalid or null user type. UserType:', userType);
        return Routes.driverTabs; // fallback to driver
    }
  };

  const initialRouteName = getInitialRouteForUserType(currentUserType);

  return (
    <MainAppStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      {currentUserType === 'driver' ? (
        <MainAppStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
      ) : currentUserType === 'individual_provider' ? (
        <MainAppStack.Screen name={Routes.providerTabs} component={SoleProviderNavigator} />
      ) : currentUserType === 'company_provider' ? (
        <MainAppStack.Screen name={Routes.providerTabs} component={CorporateProviderNavigator} />
      ) : (
        <MainAppStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
      )}
    </MainAppStack.Navigator>
  );
};

export default MainAppScreen;
