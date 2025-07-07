import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../stores/auth/authStore';
import useProviderServicesStore from '../../stores/provider/providerServicesStore';
import { Routes } from '../../navigations/routes';
import type { MainScreenProps } from '../../navigations/types';

const MOCK_SERVICES = [
  'Engine Services',
  'Car washing',
  'Evacuator',
  'Painting',
  'Yagdeyisme',
  'Razval',
  'Remendeyisme',
  'Radiator servisləri',
  'Motor servisi',
  'Self washing',
];

const ServiceSelection: React.FC = () => {
  const navigation = useNavigation<MainScreenProps<Routes.serviceSelection>['navigation']>();
  const { setPendingProfileCompletionState, userType } = useAuthStore();
  const { updateServices, isLoading: isUpdatingServices } = useProviderServicesStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(['Engine Services', 'Car washing', 'Evacuator']);

  const filteredServices = MOCK_SERVICES.filter(service =>
    service.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (name: string) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleContinue = async () => {
    try {
      // For providers, update services via API
      if (userType && (userType === 'individual_provider' || userType === 'company_provider')) {
        // Convert service names to IDs (mock implementation)
        const serviceIds = selected.map((_, index) => index + 1);
        await updateServices(serviceIds, userType);
      }
      
      // Clear pending profile completion state - user is now fully authenticated
      setPendingProfileCompletionState({ isPending: false, userType: null, email: null, step: null });
      
      // Save updated user data to AsyncStorage to persist the completion
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUserData({
          user: currentUser,
          userType: userType || 'individual_provider',
          pendingProfileCompletionStatus: false,
          email: currentUser.email || ''
        });
      }
      
      // Navigate to the main app based on user type
      if (userType === 'driver') {
        navigation.replace(Routes.driverTabs);
      } else {
        navigation.replace(Routes.providerTabs);
      }
    } catch (error) {
      console.error('Error updating services:', error);
      Alert.alert('Error', 'Failed to update services. Please try again.');
    }
  };

  const handleSkip = () => {
    // Skip also clears pending state and navigates to main app
    setPendingProfileCompletionState({ isPending: false, userType: null, email: null, step: null });
    
    // Save updated user data to AsyncStorage to persist the completion
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().setUserData({
        user: currentUser,
        userType: userType || 'individual_provider',
        pendingProfileCompletionStatus: false,
        email: currentUser.email || ''
      });
    }
    
    // Skip also navigates to main app
    if (userType === 'driver') {
      navigation.replace(Routes.driverTabs);
    } else {
      navigation.replace(Routes.providerTabs);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Services</Text>
        <Text style={styles.subHeader}>you provide</Text>
        <Text style={styles.desc}>Please select proper service types you provide, you can change later</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#B3B3B3"
          />
        </View>
        <View style={styles.chipContainer}>
          {filteredServices.map(service => (
            <TouchableOpacity
              key={service}
              style={selected.includes(service) ? styles.chipSelected : styles.chip}
              onPress={() => handleToggle(service)}
              activeOpacity={0.7}
            >
              <Text style={selected.includes(service) ? styles.chipTextSelected : styles.chipText}>
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreText}>More &gt;&gt;</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueBtn, (selected.length === 0 || isUpdatingServices) && { opacity: 0.5 }]}
          disabled={selected.length === 0 || isUpdatingServices}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            {isUpdatingServices ? 'Updating...' : 'Continue'}
          </Text>
          <Text style={styles.continueArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 120 },
  header: { fontSize: 36, fontWeight: '700', marginTop: 8 },
  subHeader: { fontSize: 36, fontWeight: '700', marginBottom: 12 },
  desc: { fontSize: 16, color: '#B3B3B3', marginBottom: 24 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: { fontSize: 20, marginRight: 8, color: '#B3B3B3' },
  searchInput: { flex: 1, fontSize: 16, color: '#222' },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#fff',
    borderColor: '#E6E6E6',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: '#D5FF5F',
    borderColor: '#D5FF5F',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 10,
  },
  chipText: { color: '#222', fontSize: 16 },
  chipTextSelected: { color: '#222', fontWeight: '700', fontSize: 16 },
  moreBtn: { alignSelf: 'flex-start', marginTop: 4, marginBottom: 16 },
  moreText: { color: '#888', fontSize: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  skipBtn: {
    borderColor: '#E6E6E6',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  skipText: { color: '#222', fontSize: 18 },
  continueBtn: {
    backgroundColor: '#222',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: { color: '#D5FF5F', fontSize: 18, fontWeight: '600' },
  continueArrow: { color: '#D5FF5F', fontSize: 22, marginLeft: 8 },
});

export default ServiceSelection; 