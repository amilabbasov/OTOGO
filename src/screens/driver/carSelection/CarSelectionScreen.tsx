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
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import useAuthStore from '../../../stores/auth/authStore';
import { Routes } from '../../../navigations/routes';
import CarForm from './components/CarForm';
import CarSummary from './components/CarSummary';
import SelectionModal from './components/SelectionModal';
import BottomButtons from './components/BottomButtons';
import carService, { CarModel, CarBrand } from '../../../services/functions/carService';
import SuccessModal from '../../../components/success/SuccessModal';
const allSetSuccessSvg = require('../../../assets/svg/success/allSet-success.svg');
import { CommonActions } from '@react-navigation/native';

const MAX_CARS = 2;

const CarSelectionScreen = () => {
  const navigation = useNavigation();
  const { pendingProfileCompletion, setPendingProfileCompletionState } = useAuthStore();
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
    brand: 0, // use id instead of string
    model: '',
  });
  const [brandModels, setBrandModels] = useState<CarModel[]>([]);
  const [brandModelsLoading, setBrandModelsLoading] = useState(false);
  const [brandModelsError, setBrandModelsError] = useState<string | null>(null);
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  const selectedBrand = brands.find(b => b.id === form.brand);

  useEffect(() => {
    // Fetch brands
    setBrandsLoading(true);
    carService.getBrands()
      .then(setBrands)
      .catch((err) => {
        setBrandsError('Failed to load car brands');
      })
      .finally(() => setBrandsLoading(false));

    // Remove global models fetch
    // setModelsLoading(true);
    // carService.getModels()
    //   .then(setModels)
    //   .catch((err) => {
    //     setModelsError('Failed to load car models');
    //   })
    //   .finally(() => setModelsLoading(false));
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (form.brand) {
      setBrandModelsLoading(true);
      setBrandModelsError(null);
      carService.getModelsByBrand(form.brand)
        .then(setBrandModels)
        .catch((err) => {
          setBrandModelsError('Failed to load car models for this brand');
        })
        .finally(() => setBrandModelsLoading(false));
    } else {
      setBrandModels([]);
    }
  }, [form.brand]);

  // Filter models by selected brand - now use brandModels directly
  const availableModels = brandModels.map((m) => m.name);

  // Filter brands based on search query
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter models based on search query
  const filteredModels = availableModels.filter(model =>
    model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => setForm({ name: '', year: '', brand: 0, model: '' });

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
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setPendingProfileCompletionState({
        ...pendingProfileCompletion,
        isPending: false,
      });
    }, 1500);
  };

  const handleContinue = async () => {
    if (cars.length === 0) {
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setPendingProfileCompletionState({
          ...pendingProfileCompletion,
          isPending: false,
        });
      }, 1500);
      return;
    }
    try {
      for (const car of cars) {
        const models: CarModel[] = await carService.getModelsByBrand(car.brand);
        const modelObj = models.find(m => m.name === car.model);
        if (!modelObj) {
          Alert.alert('Error', `Model '${car.model}' not found for selected brand.`);
          return;
        }
        await carService.postCar({
          name: car.name,
          brandId: car.brand,
          modelId: modelObj.id,
          year: Number(car.year),
        });
      }
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setPendingProfileCompletionState({
          ...pendingProfileCompletion,
          isPending: false,
        });
      }, 1500);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save car(s)');
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: Routes.driverHome as never }],
      });
    }
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

  const selectBrand = (brand: CarBrand) => {
    setForm(f => ({ ...f, brand: brand.id, model: '' }));
    closeModal();
  };

  const selectModel = (model: string) => {
    setForm(f => ({ ...f, model }));
    closeModal();
  };

  const handleOutsideFormClick = () => {
    // Only auto-save if form is complete and we're adding a new car (not editing)
    if (showForm && isFormComplete() && editingIndex === null) {
      // Add a small delay to prevent accidental saves
      setTimeout(() => {
        handleSaveCar();
      }, 100);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <SuccessModal
        visible={showSuccessModal}
        message="All ready set!"
        onHide={() => setShowSuccessModal(false)}
        svgSource={allSetSuccessSvg}
      />
      <TouchableWithoutFeedback onPress={handleOutsideFormClick}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <SvgImage source={require('../../../assets/svg/auth/goBack.svg')} width={40} height={40} />
          </TouchableOpacity>
          <Text style={styles.hello}>Hello, {firstName}</Text>
          <Text style={styles.desc}>Please add your cars up to 2, you can do this step later</Text>

          {/* Show existing cars as summary cards */}
          {cars.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              {cars.map((car, index) => {
                const carBrand = brands.find(b => b.id === car.brand);
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
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={{ marginBottom: 16 }}>
                {editingIndex === null && isFormComplete() && (
                  <Text style={styles.autoSaveHint}>Click outside to save car</Text>
                )}
                <CarForm
                  form={form}
                  setForm={setForm}
                  selectedBrand={selectedBrand}
                  onOpenBrandModal={openBrandModal}
                  onOpenModelModal={openModelModal}
                  onRemove={() => {
                    if (editingIndex !== null) {
                      handleRemove(editingIndex);
                    } else {
                      resetForm();
                      setShowForm(false);
                    }
                  }}
                />
                <TouchableOpacity
                  style={[styles.addCarBtn, !isFormComplete() && { opacity: 0.5 }]}
                  onPress={handleSaveCar}
                  disabled={!isFormComplete()}
                >
                  <Text style={styles.addCarBtnText}>{editingIndex !== null ? 'Save car' : '+ Add car'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
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
          continueDisabled={!(cars.length > 0 || (showForm && isFormComplete()))}
          showForm={showForm}
        />
      </View>
      </TouchableWithoutFeedback>

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
  autoSaveHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
});

export default CarSelectionScreen;
