import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Home Screen</Text>
      <Text style={styles.subtitle}>Welcome to your dashboard</Text>
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

export default UserHomeScreen; 