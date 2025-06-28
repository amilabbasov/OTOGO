import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TabIconProps {
  route: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ route, focused }) => {
  const getIconText = () => {
    switch (route) {
      // Customer tabs
      case 'Home':
        return '🏠';
      case 'Services':
        return '🔍';
      case 'Bookings':
        return '📅';
      case 'Profile':
        return '👤';
      
      // Provider tabs
      case 'Earnings':
        return '💰';
      
      default:
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