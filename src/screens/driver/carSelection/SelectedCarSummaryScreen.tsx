import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Routes } from '../../../navigations/routes';
import useAuthStore from '../../../stores/auth/authStore';

// Mock: In real app, get cars from store or params
const MOCK_CARS = [
  { name: 'Valkyrie', year: '2020', brand: 'Porsche', model: 'Panamera' },
  { name: 'My BMW', year: '2018', brand: 'BMW', model: 'X5' },
];

const SelectedCarSummaryScreen = () => {
  const navigation = useNavigation();
  const { pendingProfileCompletion } = useAuthStore();
  const firstName = pendingProfileCompletion.firstName || 'Driver';
  const [cars, setCars] = useState(MOCK_CARS);

  const handleEdit = (idx: number) => {
    Alert.alert('Edit not implemented in mock');
  };

  const handleRemove = (idx: number) => {
    setCars(cars.filter((_, i) => i !== idx));
  };

  const handleContinue = () => {
    navigation.navigate(Routes.driverHome as never);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.hello}>Hello, {firstName}</Text>
        <Text style={styles.title}>Your Cars</Text>
        {cars.length === 0 ? (
          <Text style={styles.emptyText}>No cars added.</Text>
        ) : (
          cars.map((car, idx) => (
            <View key={idx} style={styles.carRow}>
              <Text style={styles.carRowText}>{car.name} ({car.year}) - {car.brand} {car.model}</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => handleEdit(idx)} style={styles.editBtn}><Text>Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemove(idx)} style={styles.removeBtn}><Text>Remove</Text></TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <TouchableOpacity
          style={[styles.continueBtn, cars.length === 0 && { opacity: 0.5 }]}
          onPress={handleContinue}
          disabled={cars.length === 0}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <Text style={styles.continueBtnArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hello: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#18181B',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#18181B',
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  carRowText: {
    fontSize: 16,
    color: '#18181B',
  },
  editBtn: {
    marginRight: 8,
    padding: 4,
  },
  removeBtn: {
    padding: 4,
  },
  continueBtn: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  continueBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginRight: 8,
  },
  continueBtnArrow: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
});

export default SelectedCarSummaryScreen; 