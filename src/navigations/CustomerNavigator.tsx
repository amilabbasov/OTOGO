import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '@components/navigation/TabIcon';

// Import customer screens
import CustomerHomeScreen from '@screens/customer/home/UserHomeScreen';
import CustomerProfileScreen from '@screens/customer/profile/UserProfileScreen';
import CustomerServicesScreen from '@screens/customer/services/UserServicesScreen';
import CustomerBookingsScreen from '@screens/customer/bookings/UserBookingsScreen';

const Tab = createBottomTabNavigator();

const CustomerNavigator = () => {
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
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="Services" component={CustomerServicesScreen} />
      <Tab.Screen name="Bookings" component={CustomerBookingsScreen} />
      <Tab.Screen name="Profile" component={CustomerProfileScreen} />
    </Tab.Navigator>
  );
};

export default CustomerNavigator; 