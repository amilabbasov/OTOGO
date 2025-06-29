import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '@/components/navigation/TabIcon';

// Import customer screens
import CustomerHomeScreen from '../screens/driver/home/UserHomeScreen';
import CustomerProfileScreen from '../screens/driver/profile/UserProfileScreen';
import CustomerServicesScreen from '../screens/driver/services/UserServicesScreen';
import CustomerBookingsScreen from '../screens/driver/bookings/UserBookingsScreen';

const Tab = createBottomTabNavigator();

// Move component definition outside render
const TabBarIcon = ({ route, focused }: { route: string; focused: boolean }) => (
  <TabIcon route={route} focused={focused} />
);

const CustomerNavigator = () => {
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
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Services" component={CustomerServicesScreen} />
      <Tab.Screen name="Bookings" component={CustomerBookingsScreen} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
};

export default CustomerNavigator; 