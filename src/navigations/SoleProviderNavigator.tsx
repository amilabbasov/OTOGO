import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '../components/navigation/TabIcon';

import SoleProviderHomeScreen from '../screens/provider/sole/home/SoleProviderHomeScreen';
import SoleProviderProfileScreen from '../screens/provider/sole/profile/SoleProviderProfileScreen';
import SoleProviderServicesScreen from '../screens/provider/sole/services/SoleProviderServicesScreen'; 
import SoleProviderBookingsScreen from '../screens/provider/sole/bookings/SoleProviderBookingsScreen';
import SoleProviderEarningsScreen from '../screens/provider/sole/earnings/SoleProviderEarningsScreen';
import { Routes } from './routes';

const Tab = createBottomTabNavigator();

const SoleProviderNavigator = () => {
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
        component={SoleProviderHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name={Routes.providerServices} 
        component={SoleProviderServicesScreen}
        options={{ tabBarLabel: 'Services' }}
      />
      <Tab.Screen 
        name={Routes.providerBookings} 
        component={SoleProviderBookingsScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen 
        name={Routes.providerEarnings} 
        component={SoleProviderEarningsScreen}
        options={{ tabBarLabel: 'Earnings' }}
      />
      <Tab.Screen 
        name={Routes.providerProfile} 
        component={SoleProviderProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default SoleProviderNavigator;
