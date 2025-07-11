import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SvgImage } from '../../../../components/svgImage/SvgImage';

interface CarSummaryProps {
  form: {
    name: string;
    year: string;
    brand: string;
    model: string;
  };
  selectedBrand: any;
  onEdit: () => void;
}

const CarSummary: React.FC<CarSummaryProps> = ({ form, selectedBrand, onEdit }) => {
  return (
    <View style={styles.summaryCard}>
      <Image
        source={require('../../../../assets/images/onboarding/car.png')}
        style={{ width: 157.71, height: 53, marginRight: 16, resizeMode: 'contain' }}
      />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.summaryName}>{form.name}</Text>
          <TouchableOpacity onPress={onEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <SvgImage source={require('../../../../assets/svg/personalInfo/edit.svg')} width={14} height={14} />
          </TouchableOpacity>
        </View>
        <Text style={styles.summaryDesc}>
          {selectedBrand?.label || ''}{form.brand ? ', ' : ''}{form.model}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#DFDFDF',
    marginBottom: 24,
    paddingVertical: 13.5,
    paddingHorizontal: 16,
  },
  summaryName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#14151A',
  },
  summaryDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: '#717171',
    marginTop: 4,
  },

});

export default CarSummary; 