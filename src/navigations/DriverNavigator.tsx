import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabIcon from '../components/navigation/TabIcon';
import { Routes } from './routes';

import DriverHomeScreen from '../screens/driver/home/UserHomeScreen';
import DriverProfileScreen from '../screens/driver/profile/DriverProfileScreen';
import DriverServicesScreen from '../screens/driver/services/UserServicesScreen';

const Tab = createBottomTabNavigator();

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
      <Tab.Screen name={Routes.driverHome} component={DriverHomeScreen} />
      <Tab.Screen name={Routes.driverServices} component={DriverServicesScreen} />
      <Tab.Screen name={Routes.driverProfile} component={DriverProfileScreen} />
    </Tab.Navigator>
  );
};

export default DriverNavigator; 