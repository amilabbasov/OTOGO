import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../navigations/types';
import { Routes } from '../../navigations/routes';
import useAuthStore from '../../stores/auth/authStore';
import DriverPersonalInfoScreen from '../driver/personalInfo/DriverPersonalInfoScreen';
import SoleProviderPersonalInfoScreen from '../provider/sole/personalInfo/SoleProviderPersonalInfoScreen';
import CorporateProviderPersonalInfoScreen from '../provider/corporate/personalInfo/CorporateProviderPersonalInfoScreen';

const PersonalInfoScreen = () => {
  const route = useRoute<MainScreenProps<Routes.personalInfo>['route']>();
  const { pendingProfileCompletion } = useAuthStore();
  
  // Get userType from route params or from pending profile completion
  const userType = route.params?.userType || pendingProfileCompletion?.userType;

  switch (userType) {
    case 'driver':
      return <DriverPersonalInfoScreen />;
    case 'individual_provider':
      return <SoleProviderPersonalInfoScreen />;
    case 'company_provider':
      return <CorporateProviderPersonalInfoScreen />;
    default:
      return <DriverPersonalInfoScreen />;
  }
};

export default PersonalInfoScreen;
