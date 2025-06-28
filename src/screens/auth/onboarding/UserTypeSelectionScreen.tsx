import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../stores/auth/authStore';

const UserTypeSelectionScreen = () => {
  const navigation = useNavigation();
  const { setUserType } = useAuthStore();

  const handleUserTypeSelection = async (userType: 'customer' | 'provider') => {
    // Store user type selection
    await setUserType(userType);
    // Navigate to auth flow
    navigation.navigate('Auth' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to otogo</Text>
        <Text style={styles.subtitle}>Choose your account type</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleUserTypeSelection('customer')}
          >
            <Text style={styles.optionIcon}>👤</Text>
            <Text style={styles.optionTitle}>Customer</Text>
            <Text style={styles.optionDescription}>
              I want to book services and find providers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleUserTypeSelection('provider')}
          >
            <Text style={styles.optionIcon}>🔧</Text>
            <Text style={styles.optionTitle}>Service Provider</Text>
            <Text style={styles.optionDescription}>
              I want to provide services and earn money
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#015656',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    color: '#6B7280',
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#015656',
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default UserTypeSelectionScreen; 