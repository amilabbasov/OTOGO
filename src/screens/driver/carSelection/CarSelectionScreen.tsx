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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import useAuthStore from '../../../stores/auth/authStore';

// Mock data for brands and models
const CAR_BRANDS = [
  { label: 'Porsche', value: 'porsche', icon: '🚗', models: ['Panamera', 'Cayenne', '911'] },
  { label: 'BMW', value: 'bmw', icon: '🚙', models: ['X5', 'X6', 'M3'] },
  { label: 'Mercedes', value: 'mercedes', icon: '🚘', models: ['E-Class', 'S-Class', 'GLA'] },
  { label: 'Audi', value: 'audi', icon: '🚗', models: ['A4', 'A6', 'Q5', 'Q7'] },
  { label: 'Toyota', value: 'toyota', icon: '🚙', models: ['Camry', 'Corolla', 'RAV4', 'Highlander'] },
  { label: 'Honda', value: 'honda', icon: '🚘', models: ['Civic', 'Accord', 'CR-V', 'Pilot'] },
  { label: 'Ford', value: 'ford', icon: '🚗', models: ['Focus', 'Fusion', 'Escape', 'Explorer'] },
  { label: 'Chevrolet', value: 'chevrolet', icon: '🚙', models: ['Cruze', 'Malibu', 'Equinox', 'Tahoe'] },
  { label: 'Volkswagen', value: 'volkswagen', icon: '🚘', models: ['Golf', 'Passat', 'Tiguan', 'Atlas'] },
  { label: 'Hyundai', value: 'hyundai', icon: '🚗', models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe'] },
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
  const [form, setForm] = useState({
    name: '',
    year: '',
    brand: '',
    model: '',
  });

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

  const openBrandModal = () => {
    setModalType('brand');
    setSearchQuery('');
    setIsModalVisible(true);
  };

  const openModelModal = () => {
    if (!form.brand) return;
    setModalType('model');
    setSearchQuery('');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const selectBrand = (brand: typeof CAR_BRANDS[0]) => {
    setForm(f => ({ ...f, brand: brand.value, model: '' }));
    closeModal();
  };

  const selectModel = (model: string) => {
    setForm(f => ({ ...f, model }));
    closeModal();
  };

  const renderBrandItem = ({ item }: { item: typeof CAR_BRANDS[0] }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => selectBrand(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.itemIcon}>{item.icon}</Text>
      <Text style={styles.itemLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderModelItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => selectModel(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.itemLabel}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
              onPress={openBrandModal}
            >
              <Text style={styles.selectText}>
                {selectedBrand ? `${selectedBrand.icon} ${selectedBrand.label}` : 'Select brand'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>Car model</Text>
            <TouchableOpacity
              style={styles.select}
              disabled={!form.brand}
              onPress={openModelModal}
            >
              <Text style={styles.selectText}>
                {form.model ? `${selectedBrand?.icon || ''} ${form.model}` : 'Select model'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addCarBtn, (cars.length >= MAX_CARS || (!form.name || !form.year || !form.brand || !form.model)) && { opacity: 0.5 }]}
            onPress={handleAddOrEditCar}
            disabled={cars.length >= MAX_CARS || (!form.name || !form.year || !form.brand || !form.model)}
          >
            <Text style={styles.addCarBtnText}>{editingIndex !== null ? 'Save car' : '+ Add car'}</Text>
          </TouchableOpacity>

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

      {/* Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {modalType === 'brand' ? 'Select Brand' : 'Select Model'}
                  </Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Search ${modalType === 'brand' ? 'brands' : 'models'}...`}
                    placeholderTextColor="#B3B3B3"
                  />
                </View>

                {modalType === 'brand' ? (
                  <FlatList
                    data={filteredBrands}
                    renderItem={renderBrandItem}
                    keyExtractor={item => item.value}
                    style={styles.modalList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>No brands found</Text>
                    }
                  />
                ) : (
                  <FlatList
                    data={filteredModels}
                    renderItem={renderModelItem}
                    keyExtractor={item => item}
                    style={styles.modalList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>No models found</Text>
                    }
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  formBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DFDFDF',
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 15,
    fontSize: 16,
    marginBottom: 4,
  },
  select: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 15,
    marginBottom: 4,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#18181B',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#B3B3B3',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#18181B',
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: '#18181B',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#B3B3B3',
    fontSize: 16,
    marginTop: 40,
  },
});

export default CarSelectionScreen;
