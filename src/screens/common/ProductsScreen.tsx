import React from 'react';
import { useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../navigations/types';
import { Routes } from '../../navigations/routes';
import useAuthStore from '../../stores/auth/authStore';
import SoleProviderProductsScreen from '../provider/sole/products/SoleProviderProductsScreen';
import CorporateProviderProductsScreen from '../provider/corporate/products/CorporateProviderProductsScreen';

const ProductsScreen = () => {
  const route = useRoute<MainScreenProps<Routes.products>['route']>();
  const { pendingProfileCompletion } = useAuthStore();
  
  // Get userType from route params or from pending profile completion
  const userType = route.params?.userType || pendingProfileCompletion?.userType;

  switch (userType) {
    case 'individual_provider':
      return <SoleProviderProductsScreen />;
    case 'company_provider':
      return <CorporateProviderProductsScreen />;
    default:
      return <SoleProviderProductsScreen />;
  }
};

export default ProductsScreen; 