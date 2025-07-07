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
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon route={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#36F88D',
        tabBarInactiveTintColor: '#B3B3B3',
        tabBarShowLabel: true,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
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
