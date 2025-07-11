import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
} from 'react-native';

interface SelectionModalProps {
  visible: boolean;
  modalType: 'brand' | 'model';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredBrands: any[];
  filteredModels: string[];
  onSelectBrand: (brand: any) => void;
  onSelectModel: (model: string) => void;
  onClose: () => void;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  modalType,
  searchQuery,
  setSearchQuery,
  filteredBrands,
  filteredModels,
  onSelectBrand,
  onSelectModel,
  onClose,
  fadeAnim,
  slideAnim,
}) => {
  const renderBrandItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => onSelectBrand(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.itemLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderModelItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => onSelectModel(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.itemLabel}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalType === 'brand' ? 'Select Brand' : 'Select Model'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
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
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    minHeight: '90%',
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#18181B',
  },
  modalList: {
    flex: 1,
    minHeight: 200,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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

export default SelectionModal; 