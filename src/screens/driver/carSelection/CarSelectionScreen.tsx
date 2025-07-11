import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import useAuthStore from '../../../stores/auth/authStore';
import { Routes } from '../../../navigations/routes';
import CarForm from './components/CarForm';
import CarSummary from './components/CarSummary';
import SelectionModal from './components/SelectionModal';
import BottomButtons from './components/BottomButtons';

// Mock data for brands and models
const CAR_BRANDS = [
  { label: 'Porsche', value: 'porsche', models: ['Panamera', 'Cayenne', '911'] },
  { label: 'BMW', value: 'bmw', models: ['X5', 'X6', 'M3'] },
  { label: 'Mercedes', value: 'mercedes', models: ['E-Class', 'S-Class', 'GLA'] },
  { label: 'Audi', value: 'audi', models: ['A4', 'A6', 'Q5', 'Q7'] },
  { label: 'Toyota', value: 'toyota', models: ['Camry', 'Corolla', 'RAV4', 'Highlander'] },
  { label: 'Honda', value: 'honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot'] },
  { label: 'Ford', value: 'ford', models: ['Focus', 'Fusion', 'Escape', 'Explorer'] },
  { label: 'Chevrolet', value: 'chevrolet', models: ['Cruze', 'Malibu', 'Equinox', 'Tahoe'] },
  { label: 'Volkswagen', value: 'volkswagen', models: ['Golf', 'Passat', 'Tiguan', 'Atlas'] },
  { label: 'Hyundai', value: 'hyundai', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'] },
];

const MAX_CARS = 2;

const CarSelectionScreen = () => {
  const navigation = useNavigation();
  const { pendingProfileCompletion } = useAuthStore();
  const firstName = pendingProfileCompletion.firstName || 'Driver';
  const [cars, setCars] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'brand' | 'model'>('brand');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    year: '',
    brand: '',
    model: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const selectedBrand = CAR_BRANDS.find(b => b.value === form.brand);
  const availableModels = selectedBrand ? selectedBrand.models : [];

  // Filter brands based on search query
  const filteredBrands = CAR_BRANDS.filter(brand =>
    brand.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter models based on search query
  const filteredModels = availableModels.filter(model =>
    model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => setForm({ name: '', year: '', brand: '', model: '' });

  const isFormComplete = () => {
    return form.name && form.year && form.brand && form.model;
  };

  const handleAddCar = () => {
    setShowForm(true);
    resetForm();
    setEditingIndex(null);
  };

  const handleSaveCar = () => {
    if (!isFormComplete()) {
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
    setShowForm(false);
  };

  const handleEdit = (idx: number) => {
    setForm(cars[idx]);
    setEditingIndex(idx);
    setShowForm(true);
  };

  const handleRemove = (idx: number) => {
    setCars(cars.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      resetForm();
      setEditingIndex(null);
      setShowForm(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate(Routes.driverHome as never);
  };

  const handleContinue = () => {
    navigation.navigate(Routes.driverHome as never);
  };

  const openBrandModal = () => {
    setModalType('brand');
    setSearchQuery('');
    setIsModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const openModelModal = () => {
    if (!form.brand) {
      Alert.alert('Error', 'Please select a brand first');
      return;
    }
    setModalType('model');
    setSearchQuery('');
    setIsModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalVisible(false);
      setSearchQuery('');
    });
  };

  const selectBrand = (brand: typeof CAR_BRANDS[0]) => {
    setForm(f => ({ ...f, brand: brand.value, model: '' }));
    closeModal();
  };

  const selectModel = (model: string) => {
    setForm(f => ({ ...f, model }));
    closeModal();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <SvgImage source={require('../../../assets/svg/auth/goBack.svg')} width={40} height={40} />
          </TouchableOpacity>
          <Text style={styles.hello}>Hello, {firstName}</Text>
          <Text style={styles.desc}>Please add your cars up to 2, you can do this step later</Text>

          {/* Show existing cars as summary cards */}
          {cars.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              {cars.map((car, index) => {
                const carBrand = CAR_BRANDS.find(b => b.value === car.brand);
                return (
                  <CarSummary
                    key={index}
                    form={car}
                    selectedBrand={carBrand}
                    onEdit={() => handleEdit(index)}
                  />
                );
              })}
            </View>
          )}

          {/* Show form when adding/editing */}
          {showForm && (
            <View style={{ marginBottom: 16 }}>
              <CarForm
                form={form}
                setForm={setForm}
                selectedBrand={selectedBrand}
                onOpenBrandModal={openBrandModal}
                onOpenModelModal={openModelModal}
                onRemove={() => editingIndex !== null && handleRemove(editingIndex)}
              />
              <TouchableOpacity
                style={[styles.addCarBtn, !isFormComplete() && { opacity: 0.5 }]}
                onPress={handleSaveCar}
                disabled={!isFormComplete()}
              >
                <Text style={styles.addCarBtnText}>{editingIndex !== null ? 'Save car' : '+ Add car'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Show add car button when not showing form and under limit */}
          {!showForm && cars.length < MAX_CARS && (
            <TouchableOpacity style={styles.addCarBtn} onPress={handleAddCar}>
              <Text style={styles.addCarBtnText}>+ Add car</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        
        <BottomButtons
          carsCount={cars.length}
          onSkip={handleSkip}
          onContinue={handleContinue}
          continueDisabled={showForm && !isFormComplete()}
        />
      </View>

      <SelectionModal
        visible={isModalVisible}
        modalType={modalType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredBrands={filteredBrands}
        filteredModels={filteredModels}
        onSelectBrand={selectBrand}
        onSelectModel={selectModel}
        onClose={closeModal}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#FAFAFA',
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
  addCarBtn: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 4,
    marginBottom: 25,
    borderColor: '#EDEDED',
  },
  addCarBtnText: {
    fontSize: 16,
    color: '#18181B',
    fontWeight: '600',
  },
});

export default CarSelectionScreen;
