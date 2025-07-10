import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import useAuthStore from '../../../stores/auth/authStore';

// Mock data for brands and models
const CAR_BRANDS = [
  { label: 'Porsche', value: 'porsche', icon: '🚗', models: ['Panamera', 'Cayenne', '911'] },
  { label: 'BMW', value: 'bmw', icon: '🚙', models: ['X5', 'X6', 'M3'] },
  { label: 'Mercedes', value: 'mercedes', icon: '🚘', models: ['E-Class', 'S-Class', 'GLA'] },
];

const MAX_CARS = 2;

const CarSelectionScreen = () => {
  const navigation = useNavigation();
  const { pendingProfileCompletion } = useAuthStore();
  const firstName = pendingProfileCompletion.firstName || 'Driver';
  const [cars, setCars] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    year: '',
    brand: '',
    model: '',
  });

  const selectedBrand = CAR_BRANDS.find(b => b.value === form.brand);
  const availableModels = selectedBrand ? selectedBrand.models : [];

  const resetForm = () => setForm({ name: '', year: '', brand: '', model: '' });

  const handleAddOrEditCar = () => {
    if (!form.name || !form.year || !form.brand || !form.model) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (editingIndex !== null) {
      const updated = [...cars];
      updated[editingIndex] = { ...form };
      setCars(updated);
      setEditingIndex(null);
    } else {
      setCars([...cars, { ...form }]);
    }
    resetForm();
  };

  const handleEdit = (idx: number) => {
    setForm(cars[idx]);
    setEditingIndex(idx);
  };

  const handleRemove = (idx: number) => {
    setCars(cars.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      resetForm();
      setEditingIndex(null);
    }
  };

  const handleSkip = () => {
    navigation.navigate('driverHome' as never);
  };

  const handleContinue = () => {
    navigation.navigate('selectedCarSummary' as never);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <SvgImage source={require('../../../assets/svg/auth/goBack.svg')} width={40} height={40} />
          </TouchableOpacity>
          <Text style={styles.hello}>Hello, {firstName}</Text>
          <Text style={styles.desc}>Please add your cars up to 2, you can do this step later</Text>

          <View style={styles.formBox}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              placeholder="Valkyrie"
            />
            <Text style={styles.label}>Production year</Text>
            <TextInput
              style={styles.input}
              value={form.year}
              onChangeText={v => setForm(f => ({ ...f, year: v.replace(/[^0-9]/g, '') }))}
              placeholder="2020"
              keyboardType="numeric"
              maxLength={4}
            />
            <Text style={styles.label}>Car brand</Text>
            <TouchableOpacity
              style={styles.select}
              onPress={() => {
                // Simple brand picker
                Alert.alert('Select Brand', '', CAR_BRANDS.map(b => ({
                  text: b.label,
                  onPress: () => setForm(f => ({ ...f, brand: b.value, model: '' })),
                })));
              }}
            >
              <Text style={styles.selectText}>
                {selectedBrand ? `${selectedBrand.icon} ${selectedBrand.label}` : 'Select brand'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>Car model</Text>
            <TouchableOpacity
              style={styles.select}
              disabled={!form.brand}
              onPress={() => {
                if (!form.brand) return;
                Alert.alert('Select Model', '', availableModels.map(m => ({
                  text: m,
                  onPress: () => setForm(f => ({ ...f, model: m })),
                })));
              }}
            >
              <Text style={styles.selectText}>
                {form.model ? `${selectedBrand?.icon || ''} ${form.model}` : 'Select model'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addCarBtn, (cars.length >= MAX_CARS || (!form.name || !form.year || !form.brand || !form.model)) && { opacity: 0.5 }]}
              onPress={handleAddOrEditCar}
              disabled={cars.length >= MAX_CARS || (!form.name || !form.year || !form.brand || !form.model)}
            >
              <Text style={styles.addCarBtnText}>{editingIndex !== null ? 'Save car' : '+ Add car'}</Text>
            </TouchableOpacity>
          </View>

          {cars.length > 0 && (
            <View style={styles.addedCarsBox}>
              <Text style={styles.addedCarsTitle}>Added cars</Text>
              {cars.map((car, idx) => (
                <View key={idx} style={styles.carRow}>
                  <Text style={styles.carRowText}>{car.name} ({car.year}) - {car.brand} {car.model}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => handleEdit(idx)} style={styles.editBtn}><Text>Edit</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemove(idx)} style={styles.removeBtn}><Text>Remove</Text></TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.continueBtn, cars.length === 0 && { opacity: 0.5 }]}
              onPress={handleContinue}
              disabled={cars.length === 0}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
              <Text style={styles.continueBtnArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 16,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  hello: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#18181B',
  },
  desc: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  formBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  select: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 12,
    marginBottom: 4,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#18181B',
  },
  addCarBtn: {
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  addCarBtnText: {
    fontSize: 16,
    color: '#18181B',
    fontWeight: '600',
  },
  addedCarsBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  addedCarsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#18181B',
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carRowText: {
    fontSize: 15,
    color: '#18181B',
  },
  editBtn: {
    marginRight: 8,
    padding: 4,
  },
  removeBtn: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  skipBtn: {
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  skipBtnText: {
    fontSize: 16,
    color: '#18181B',
    fontWeight: '500',
  },
  continueBtn: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default CarSelectionScreen;
