import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverNavigator from './DriverNavigator';
import SoleProviderNavigator from './SoleProviderNavigator';
import CorporateProviderNavigator from './CorporateProviderNavigator';
import PersonalInfoScreen from '../screens/common/PersonalInfoScreen';
// import CarSelectionScreen from '../screens/driver/carSelection/CarSelectionScreen'; // Car selection commented out
import UserTypeSelectionScreen from '../screens/auth/onboarding/flow/UserTypeSelectionScreen';
import { useAuthStore } from '../stores/auth/authStore';
import { Routes } from './routes';
import { UserType } from '../types/common';

const MainStack = createNativeStackNavigator();

export const MainRouter = () => {
  const { userType: storeUserType, token, user, pendingProfileCompletion, setPendingProfileCompletion } = useAuthStore();
  
  const userType = storeUserType || pendingProfileCompletion?.userType;
  
  console.log('MainRouter render. UserType:', userType, 'Store UserType:', storeUserType, 'Token present:', !!token, 'User:', user?.email, 'Pending Profile:', pendingProfileCompletion);

  // If there's pending profile completion, allow access even without token
  if (!token && !pendingProfileCompletion) {
    console.log('MainRouter: No token and no pending profile completion. Returning null.');
    return null;
  }

  if (pendingProfileCompletion && !pendingProfileCompletion.userType) {
    console.log('MainRouter: Pending profile completion but no userType. Showing UserType selection.');
    return (
      <MainStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="UserTypeSelection"
      >
        <MainStack.Screen 
          name="UserTypeSelection" 
          children={() => (
            <UserTypeSelectionScreen 
              onNext={(selectedUserType: string) => {
                const userTypeMap: { [key: string]: UserType } = {
                  'driver': 'driver',
                  'provider': 'sole_provider'
                };
                const mappedUserType = userTypeMap[selectedUserType] || 'driver';
                console.log('User selected userType:', selectedUserType, 'mapped to:', mappedUserType);
                setPendingProfileCompletion(pendingProfileCompletion.email, mappedUserType);
              }}
            />
          )}
        />
      </MainStack.Navigator>
    );
  }

  // If there's pending profile completion, always start with personalInfo
  const initialRouteName = pendingProfileCompletion ? Routes.personalInfo : getInitialRouteForUserType(userType || null);
  console.log('MainRouter: Decided initial route name:', initialRouteName);


  return (
    <MainStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <MainStack.Screen name={Routes.personalInfo} component={PersonalInfoScreen} />
      {/* <MainStack.Screen name={Routes.carSelection} component={CarSelectionScreen} /> Car selection commented out */}
      {userType === 'driver' ? (
        <>
          {console.log('MainRouter: User is DRIVER. Rendering DriverNavigator.')}
          <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
        </>
      ) : userType === 'sole_provider' ? (
        <>
          {console.log('MainRouter: User is SOLE_PROVIDER. Rendering SoleProviderNavigator.')}
          <MainStack.Screen name={Routes.providerTabs} component={SoleProviderNavigator} />
        </>
      ) : userType === 'corporate_provider' ? (
        <>
          {console.log('MainRouter: User is CORPORATE_PROVIDER. Rendering CorporateProviderNavigator.')}
          <MainStack.Screen name={Routes.providerTabs} component={CorporateProviderNavigator} />
        </>
      ) : (
        <>
          {console.warn('MainRouter: Unknown user type. Defaulting to DriverNavigator.', userType)}
          <MainStack.Screen name={Routes.driverTabs} component={DriverNavigator} />
        </>
      )}
    </MainStack.Navigator>
  );
};

const getInitialRouteForUserType = (userType: string | null): string => {
  console.log('getInitialRouteForUserType called with:', userType);
  switch (userType) {
    case 'driver':
      return Routes.driverTabs;
    case 'sole_provider':
    case 'corporate_provider':
      return Routes.providerTabs;
    default:
      console.warn('Unknown user type in getInitialRouteForUserType, defaulting to driverTabs.');
      return Routes.driverTabs;
  }
};