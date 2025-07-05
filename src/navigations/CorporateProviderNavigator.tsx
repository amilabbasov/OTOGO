import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '../components/navigation/TabIcon';

import CorporateProviderHomeScreen from '../screens/provider/corporate/home/CorporateProviderHomeScreen';
import CorporateProviderProfileScreen from '../screens/provider/corporate/profile/CorporateProviderProfileScreen';
import CorporateProviderServicesScreen from '../screens/provider/corporate/services/CorporateProviderServicesScreen'; 
import CorporateProviderBookingsScreen from '../screens/provider/corporate/bookings/CorporateProviderBookingsScreen';
import CorporateProviderEarningsScreen from '../screens/provider/corporate/earnings/CorporateProviderEarningsScreen';
import { Routes } from './routes';

const Tab = createBottomTabNavigator();

const CorporateProviderNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon route={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#36F88D',
        tabBarInactiveTintColor: '#B3B3B3',
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
        },
      })}
    >
      <Tab.Screen name={Routes.providerHome} component={CorporateProviderHomeScreen} />
      <Tab.Screen name={Routes.providerServices} component={CorporateProviderServicesScreen} />
      <Tab.Screen name={Routes.providerBookings} component={CorporateProviderBookingsScreen} />
      <Tab.Screen name={Routes.providerEarnings} component={CorporateProviderEarningsScreen} />
      <Tab.Screen name={Routes.providerProfile} component={CorporateProviderProfileScreen} />
    </Tab.Navigator>
  );
};

export default CorporateProviderNavigator;
