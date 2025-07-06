import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../../../navigations/types';
import { Routes } from '../../../../navigations/routes';
import { colors } from '../../../../theme/color';
import useAuthStore from '../../../../stores/auth/authStore';

interface VehicleType {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: string[];
}

const vehicleTypes: VehicleType[] = [
  {
    id: 'car',
    name: 'Car Wash',
    description: 'Standard car washing services',
    icon: '🚗',
    services: ['exterior_wash', 'interior_clean', 'waxing'],
  },
  {
    id: 'suv',
    name: 'SUV Wash',
    description: 'Larger vehicle washing services',
    icon: '🚙',
    services: ['exterior_wash', 'interior_clean', 'waxing', 'tire_cleaning'],
  },
  {
    id: 'truck',
    name: 'Truck Wash',
    description: 'Commercial vehicle services',
    icon: '🚛',
    services: ['exterior_wash', 'interior_clean', 'engine_cleaning'],
  },
  {
    id: 'motorcycle',
    name: 'Motorcycle Wash',
    description: 'Two-wheel vehicle services',
    icon: '🏍️',
    services: ['exterior_wash', 'chain_cleaning', 'polishing'],
  },
  {
    id: 'boat',
    name: 'Boat Wash',
    description: 'Marine vehicle services',
    icon: '🚤',
    services: ['exterior_wash', 'interior_clean', 'hull_cleaning'],
  },
];

const SoleProviderCarSelectionScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.carSelection>['navigation']>();
  const route = useRoute<MainScreenProps<Routes.carSelection>['route']>();
  const { setPendingProfileCompletionState } = useAuthStore();
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedVehicles.length === 0) {
      Alert.alert(t('Error'), t('Please select at least one vehicle type'));
      return;
    }

    // Complete the sole provider registration flow
    Alert.alert(
      t('Success'),
      t('Registration completed successfully! Welcome to OTOGO.'),
      [
        {
          text: t('OK'),
          onPress: () => {
            // Mark profile completion as done - this will trigger MainRouter to show the main app
            setPendingProfileCompletionState({ isPending: false, userType: null, email: null });
          }
        }
      ]
    );
  };

  const renderVehicleType = ({ item }: { item: VehicleType }) => (
    <TouchableOpacity
      style={[
        styles.vehicleTypeCard,
        selectedVehicles.includes(item.id) && styles.selectedCard
      ]}
      onPress={() => handleVehicleSelection(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.vehicleTypeIcon}>
        <Text style={styles.vehicleTypeEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.vehicleTypeInfo}>
        <Text style={styles.vehicleTypeName}>{item.name}</Text>
        <Text style={styles.vehicleTypeDescription}>{item.description}</Text>
        <Text style={styles.vehicleTypeServices}>
          {item.services.length} service{item.services.length !== 1 ? 's' : ''} available
        </Text>
      </View>
      <View style={styles.selectionIndicator}>
        {selectedVehicles.includes(item.id) && (
          <View style={styles.selectedIndicator} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your</Text>
          <Text style={styles.title}>Vehicle Types</Text>
          <Text style={styles.subtitle}>
            Choose the types of vehicles you can provide services for
          </Text>
        </View>

        <FlatList
          data={vehicleTypes}
          renderItem={renderVehicleType}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedVehicles.length === 0 && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={selectedVehicles.length === 0}
          >
            <Text style={styles.continueButtonText}>
              Complete Registration
            </Text>
            <Text style={styles.continueButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
    marginBottom: 0,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: '#14151A',
    marginTop: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: 20,
  },
  vehicleTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: '#F5FFF5',
  },
  vehicleTypeIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#E8F5E8',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleTypeEmoji: {
    fontSize: 24,
  },
  vehicleTypeInfo: {
    flex: 1,
  },
  vehicleTypeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  vehicleTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  vehicleTypeServices: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#B3B3B3',
  },
  continueButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  continueButtonArrow: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SoleProviderCarSelectionScreen; 