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
import type { MainScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import { colors } from '../../../theme/color';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import useAuthStore from '../../../stores/auth/authStore';

interface CarType {
  id: string;
  name: string;
  description: string;
  icon: string;
  capacity: string;
}

const carTypes: CarType[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Compact and fuel-efficient',
    icon: '🚗',
    capacity: '4 seats',
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Comfortable for daily rides',
    icon: '🚙',
    capacity: '4-5 seats',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury and comfort',
    icon: '🚗',
    capacity: '4-5 seats',
  },
  {
    id: 'suv',
    name: 'SUV',
    description: 'Spacious and versatile',
    icon: '🚐',
    capacity: '6-7 seats',
  },
  {
    id: 'van',
    name: 'Van',
    description: 'Large groups and cargo',
    icon: '🚐',
    capacity: '8+ seats',
  },
];

const CarSelectionScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.serviceSelection>['navigation']>();
  const route = useRoute<MainScreenProps<Routes.serviceSelection>['route']>();
  const { setPendingProfileCompletionState } = useAuthStore();
  const [selectedCarType, setSelectedCarType] = useState<string | null>(null);

  const handleCarSelection = (carId: string) => {
    setSelectedCarType(carId);
  };

  const handleContinue = () => {
    if (!selectedCarType) {
      Alert.alert(t('Error'), t('Please select a car type'));
      return;
    }

    // Complete the driver registration flow
    Alert.alert(
      t('Success'),
      t('Registration completed successfully! Welcome to OTOGO.'),
      [
        {
          text: t('OK'),
          onPress: () => {
            // Mark profile completion as done - this will trigger MainRouter to show the main app
            setPendingProfileCompletionState({ 
              isPending: false, 
              userType: null, 
              email: null, 
              step: null 
            });
          }
        }
      ]
    );
  };

  const renderCarType = ({ item }: { item: CarType }) => (
    <TouchableOpacity
      style={[
        styles.carTypeCard,
        selectedCarType === item.id && styles.selectedCard
      ]}
      onPress={() => handleCarSelection(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.carTypeIcon}>
        <Text style={styles.carTypeEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.carTypeInfo}>
        <Text style={styles.carTypeName}>{item.name}</Text>
        <Text style={styles.carTypeDescription}>{item.description}</Text>
        <Text style={styles.carTypeCapacity}>{item.capacity}</Text>
      </View>
      <View style={styles.selectionIndicator}>
        {selectedCarType === item.id && (
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
          <Text style={styles.title}>Car Type</Text>
          <Text style={styles.subtitle}>
            Choose the type of vehicle you'll be driving with OTOGO
          </Text>
        </View>

        <FlatList
          data={carTypes}
          renderItem={renderCarType}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedCarType && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!selectedCarType}
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
  carTypeCard: {
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
  carTypeIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#E8F5E8',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  carTypeEmoji: {
    fontSize: 24,
  },
  carTypeInfo: {
    flex: 1,
  },
  carTypeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  carTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  carTypeCapacity: {
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

export default CarSelectionScreen;
