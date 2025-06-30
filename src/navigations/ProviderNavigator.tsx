import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '../components/navigation/TabIcon';

// Import provider screens
import ProviderHomeScreen from '../screens/provider/home/ProviderHomeScreen';
import ProviderProfileScreen from '../screens/provider/profile/ProviderProfileScreen';
import ProviderServicesScreen from '../screens/provider/services/ProviderServicesScreen'; 
import ProviderBookingsScreen from '../screens/provider/bookings/ProviderBookingsScreen';
import ProviderEarningsScreen from '../screens/provider/earnings/ProviderEarningsScreen';
import { Routes } from './routes';

const Tab = createBottomTabNavigator();

const ProviderNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon route={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#015656',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name={Routes.providerHome} component={ProviderHomeScreen} />
      <Tab.Screen name={Routes.providerServices} component={ProviderServicesScreen} />
      <Tab.Screen name={Routes.providerBookings} component={ProviderBookingsScreen} />
      <Tab.Screen name={Routes.providerEarnings} component={ProviderEarningsScreen} />
      <Tab.Screen name={Routes.providerProfile} component={ProviderProfileScreen} />
    </Tab.Navigator>
  );
};

export default ProviderNavigator; 