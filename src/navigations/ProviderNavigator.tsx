import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '@components/navigation/TabIcon';

// Import provider screens
import ProviderHomeScreen from '@screens/provider/home/ProviderHomeScreen';
import ProviderProfileScreen from '@screens/provider/profile/ProviderProfileScreen';
import ProviderServicesScreen from '@screens/provider/services/ProviderServicesScreen';
import ProviderBookingsScreen from '@screens/provider/bookings/ProviderBookingsScreen';
import ProviderEarningsScreen from '@screens/provider/earnings/ProviderEarningsScreen';

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
      <Tab.Screen name="Home" component={ProviderHomeScreen} />
      <Tab.Screen name="Services" component={ProviderServicesScreen} />
      <Tab.Screen name="Bookings" component={ProviderBookingsScreen} />
      <Tab.Screen name="Earnings" component={ProviderEarningsScreen} />
      <Tab.Screen name="Profile" component={ProviderProfileScreen} />
    </Tab.Navigator>
  );
};

export default ProviderNavigator; 