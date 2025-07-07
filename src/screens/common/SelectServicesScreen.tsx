import React from 'react';
import { useRoute } from '@react-navigation/native';
import useAuthStore from '../../stores/auth/authStore';
import ServiceSelection from '../../components/serviceSelection/ServiceSelection';

const SelectServicesScreen = () => {
  const route = useRoute<any>();
  const { pendingProfileCompletion } = useAuthStore();
  const userType = route.params?.userType || pendingProfileCompletion?.userType;

  // For now, render the same component for both provider types
  switch (userType) {
    case 'individual_provider':
    case 'company_provider':
      return <ServiceSelection />;
    default:
      return <ServiceSelection />;
  }
};

export default SelectServicesScreen; 