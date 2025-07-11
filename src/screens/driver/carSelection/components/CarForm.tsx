import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SvgImage } from '../../../../components/svgImage/SvgImage';

interface CarFormProps {
  form: {
    name: string;
    year: string;
    brand: string;
    model: string;
  };
  setForm: (form: any) => void;
  selectedBrand: any;
  onOpenBrandModal: () => void;
  onOpenModelModal: () => void;
  onRemove: () => void;
}

const CarForm: React.FC<CarFormProps> = ({
  form,
  setForm,
  selectedBrand,
  onOpenBrandModal,
  onOpenModelModal,
  onRemove,
}) => {
  return (
    <View style={styles.formBox}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(v: string) => setForm((f: any) => ({ ...f, name: v }))}
        placeholder="Valkyrie"
      />
      <Text style={styles.label}>Production year</Text>
      <TextInput
        style={styles.input}
        value={form.year}
        onChangeText={(v: string) => setForm((f: any) => ({ ...f, year: v.replace(/[^0-9]/g, '') }))}
        placeholder="2020"
        keyboardType="numeric"
        maxLength={4}
      />
      <Text style={styles.label}>Car brand</Text>
      <TouchableOpacity style={styles.select} onPress={onOpenBrandModal}>
        {selectedBrand && (
          <SvgImage source={require('../../../../assets/svg/personalInfo/car.svg')} width={20} height={20} />
        )}
        <Text style={styles.selectText}>
          {selectedBrand ? selectedBrand.label : 'Select brand'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.label}>Car model</Text>
      <TouchableOpacity
        style={styles.select}
        disabled={!form.brand}
        onPress={onOpenModelModal}
      >
        {form.model && (
          <SvgImage source={require('../../../../assets/svg/personalInfo/car.svg')} width={20} height={20} />
        )}
        <Text style={styles.selectText}>
          {form.model ? form.model : 'Select model'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#18181B',
    marginLeft: 8,
  },
  removeButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 13,
    paddingHorizontal: 125,
    borderWidth: 1,
    borderColor: '#C40C0C',
    borderRadius: 14,
  },
  removeButtonText: {
    color: '#C40C0C',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CarForm; 