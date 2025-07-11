import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '../components/navigation/TabIcon';

import CorporateProviderHomeScreen from '../screens/provider/corporate/home/CorporateProviderHomeScreen';
import CorporateProviderProfileScreen from '../screens/provider/corporate/profile/CorporateProviderProfileScreen';
import CorporateProviderBookingsScreen from '../screens/provider/corporate/bookings/CorporateProviderBookingsScreen';
import CorporateProviderEarningsScreen from '../screens/provider/corporate/earnings/CorporateProviderEarningsScreen';
import { Routes } from './routes';

const Tab = createBottomTabNavigator();

const CorporateProviderNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon route={route.name} focused={focused} />
        ),
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#181818',
          borderTopWidth: 0,
          borderRadius: 40,
          marginHorizontal: 16,
          marginBottom: 16,
          height: 80,
          position: 'absolute',
          left: 0,
          right: 0,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
      })}
    >
      <Tab.Screen 
        name={Routes.providerHome} 
        component={CorporateProviderHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name={Routes.providerBookings} 
        component={CorporateProviderBookingsScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen 
        name={Routes.providerEarnings} 
        component={CorporateProviderEarningsScreen}
        options={{ tabBarLabel: 'Earnings' }}
      />
      <Tab.Screen 
        name={Routes.providerProfile} 
        component={CorporateProviderProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default CorporateProviderNavigator;
