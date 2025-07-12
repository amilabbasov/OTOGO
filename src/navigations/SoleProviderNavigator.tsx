import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '../components/navigation/TabIcon';

import SoleProviderHomeScreen from '../screens/provider/sole/home/SoleProviderHomeScreen';
import SoleProviderProfileScreen from '../screens/provider/sole/profile/SoleProviderProfileScreen';
import SoleProviderBookingsScreen from '../screens/provider/sole/bookings/SoleProviderBookingsScreen';
import { Routes } from './routes';

const Tab = createBottomTabNavigator();

const SoleProviderNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon route={route.name} focused={focused} />
        ),
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#181818',
          borderRadius: 40,
          marginHorizontal: 16,
          marginBottom: 35,
          height: 80,
          position: 'absolute',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
      })}
    >
      <Tab.Screen 
        name={Routes.providerHome} 
        component={SoleProviderHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name={Routes.providerSearch} 
        component={SoleProviderBookingsScreen}
        options={{ tabBarLabel: 'Search' }}
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
