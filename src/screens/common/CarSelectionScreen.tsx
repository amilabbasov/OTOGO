import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../navigations/types';
import { Routes } from '../../navigations/routes';
import useAuthStore from '../../stores/auth/authStore';
import DriverCarSelectionScreen from '../driver/carSelection/CarSelectionScreen';
import SoleProviderCarSelectionScreen from '../provider/sole/carSelection/SoleProviderCarSelectionScreen';
import CorporateProviderCarSelectionScreen from '../provider/corporate/carSelection/CorporateProviderCarSelectionScreen';

const CarSelectionScreen = () => {
  const route = useRoute<MainScreenProps<Routes.carSelection>['route']>();
  const { pendingProfileCompletion } = useAuthStore();
  
  // Get userType from route params or from pending profile completion
  const userType = route.params?.userType || pendingProfileCompletion?.userType;

  switch (userType) {
    case 'driver':
      return <DriverCarSelectionScreen />;
    case 'individual_provider':
      return <SoleProviderCarSelectionScreen />;
    case 'company_provider':
      return <CorporateProviderCarSelectionScreen />;
    default:
      return <DriverCarSelectionScreen />;
  }
};

export default CarSelectionScreen; 