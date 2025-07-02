import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '@/components/navigation/TabIcon';

// Import driver screens
import DriverHomeScreen from '../screens/driver/home/UserHomeScreen';
import DriverProfileScreen from '../screens/driver/profile/UserProfileScreen';
import DriverServicesScreen from '../screens/driver/services/UserServicesScreen';
import DriverBookingsScreen from '../screens/driver/bookings/UserBookingsScreen';

const Tab = createBottomTabNavigator();

// Move component definition outside render
const TabBarIcon = ({ route, focused }: { route: string; focused: boolean }) => (
  <TabIcon route={route} focused={focused} />
);

const DriverNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color: _color, size: _size }) => (
          <TabBarIcon route={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#015656',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DriverHomeScreen} />
      <Tab.Screen name="Services" component={DriverServicesScreen} />
      <Tab.Screen name="Bookings" component={DriverBookingsScreen} />
      <Tab.Screen name="Profile" component={DriverProfileScreen} />
    </Tab.Navigator>
  );
};

export default DriverNavigator; 