import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PersonalInfoScreen from '../screens/common/PersonalInfoScreen';
import MainAppScreen from '../screens/common/MainAppScreen';
import CarSelectionScreen from '../screens/driver/carSelection/CarSelectionScreen';
import SelectServicesScreen from '..//screens/common/SelectServicesScreen';
import ProductsScreen from '../screens/common/ProductsScreen';
import BranchesScreen from '../screens/common/BranchesScreen';
import UserTypeSelectionScreen from '../screens/auth/onboarding/flow/UserTypeSelectionScreen';
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

  if (!isAuthenticated) {
    return null;
  }

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
                  'driver': 'driver', 'individual_provider': 'individual_provider', 'company_provider': 'company_provider'
                };
                const mappedUserType = userTypeMap[selectedUserType] || 'driver';
                setPendingProfileCompletionState({
                  ...pendingProfileCompletion, userType: mappedUserType,
                });
              }}
            />
          )}
        />
      </MainStack.Navigator>
    );
  }

  if (pendingProfileCompletion.isPending) {
    console.log('MainRouter: Current pendingProfileCompletion:', pendingProfileCompletion);
    
    // Render different screens based on the current step
    switch (pendingProfileCompletion.step) {
      case 'personalInfo':
        return <PersonalInfoScreen />;
      case 'serviceSelection':
        const userType = pendingProfileCompletion.userType;
        if (userType === 'driver') {
          return <CarSelectionScreen />;
        }
        return <SelectServicesScreen />;
      case 'products':
        return <ProductsScreen />;
      case 'branches':
        return <BranchesScreen />;
      default:
        return <PersonalInfoScreen />;
    }
  }

  return null;
};