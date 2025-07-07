import React from 'react';
import SelectServicesScreen from '../../../common/SelectServicesScreen';

const CorporateProviderServicesScreen: React.FC = (props) => {
  // Just reuse the common SelectServicesScreen for company providers
  return <SelectServicesScreen {...props} />;
};

export default CorporateProviderServicesScreen; 