import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserServicesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Services</Text>
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
    color: '#015656',
  },
});

export default UserServicesScreen; 