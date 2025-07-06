import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../navigations/types';
import { Routes } from '../../navigations/routes';
import useAuthStore from '../../stores/auth/authStore';
import SoleProviderBranchesScreen from '../provider/sole/branches/SoleProviderBranchesScreen';
import CorporateProviderBranchesScreen from '../provider/corporate/branches/CorporateProviderBranchesScreen';

const BranchesScreen = () => {
  const route = useRoute<MainScreenProps<Routes.branches>['route']>();
  const { pendingProfileCompletion } = useAuthStore();
  
  // Get userType from route params or from pending profile completion
  const userType = route.params?.userType || pendingProfileCompletion?.userType;

  // Only corporate providers have branches
  if (userType === 'company_provider') {
    return <CorporateProviderBranchesScreen />;
  }
  
  // For individual providers or any other case, this screen shouldn't be reached
  // but if it is, redirect to main app
  return null;
};

export default BranchesScreen; 