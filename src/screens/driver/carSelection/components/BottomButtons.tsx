import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomButtonsProps {
  carsCount: number;
  onSkip: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
}

const BottomButtons: React.FC<BottomButtonsProps> = ({ carsCount, onSkip, onContinue, continueDisabled = false }) => {
  const isDisabled = carsCount === 0 || continueDisabled;
  
  return (
    <View style={styles.bottomRow}>
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
        <Text style={styles.skipBtnText}>Skip</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.continueBtn, isDisabled && { opacity: 0.5 }]}
        onPress={onContinue}
        disabled={isDisabled}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
        <Text style={styles.continueBtnArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 5,
    gap: 10,
  },
  skipBtn: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#B3B3B3',
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    fontSize: 16,
    color: '#18181B',
    fontWeight: '500',
  },
  continueBtn: {
    flex: 2,
    backgroundColor: '#18181B',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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

export default BottomButtons; 