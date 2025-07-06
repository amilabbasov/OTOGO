import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TabIconProps {
  route: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ route, focused }) => {
  const getIconText = () => {
    switch (route) {
      // Driver tabs
      case 'driverHome':
        return '🏠';
      case 'driverServices':
        return '🔍';
      case 'driverBookings':
        return '📅';
      case 'driverProfile':
        return '👤';
      
      // Provider tabs
      case 'providerHome':
        return '🏠';
      case 'providerServices':
        return '🔧';
      case 'providerBookings':
        return '📅';
      case 'providerEarnings':
        return '💰';
      case 'providerProfile':
        return '👤';
      
      // Legacy support (if any old route names are still used)
      case 'Home':
        return '🏠';
      case 'Services':
        return '🔍';
      case 'Bookings':
        return '📅';
      case 'Profile':
        return '👤';
      case 'Earnings':
        return '💰';
      
      default:
        console.warn('Unknown route for tab icon:', route);
        return '📱';
    }
  };

  return (
    <View style={[styles.container, focused && styles.focused]}>
      <Text style={[styles.icon, focused && styles.focusedText]}>
        {getIconText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  focused: {
    // Add focused styles if needed
  },
  icon: {
    fontSize: 20,
  },
  focusedText: {
    // Add focused text styles if needed
  },
});

export default TabIcon; 