import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CorporateProviderHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Provider Dashboard</Text>
      <Text style={styles.subtitle}>Manage your services and bookings</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#015656',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default CorporateProviderHomeScreen; 