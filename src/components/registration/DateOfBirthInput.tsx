import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { SvgImage } from '../svgImage/SvgImage';

interface DateOfBirthInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

const formatDate = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  let formatted = cleaned;
  if (cleaned.length >= 2) {
    formatted = cleaned.slice(0, 2);
    if (cleaned.length >= 4) {
      formatted += '/' + cleaned.slice(2, 4);
      if (cleaned.length >= 8) {
        formatted += '/' + cleaned.slice(4, 8);
      } else if (cleaned.length > 4) {
        formatted += '/' + cleaned.slice(4);
      }
    } else if (cleaned.length > 2) {
      formatted += '/' + cleaned.slice(2);
    }
  }
  return formatted.slice(0, 10);
};

function validateDate(value: string): string | null {
  // Only validate if full date is entered
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split('/').map(Number);
  if (day < 1 || day > 31) return 'Please enter a valid day';
  if (month < 1 || month > 12) return 'Please enter a valid month';
  if (year < 1900 || year > 2100) return 'Please enter a valid year';
  // Check if it's a valid date
  const testDate = new Date(year, month - 1, day);
  if (
    testDate.getDate() !== day ||
    testDate.getMonth() !== month - 1 ||
    testDate.getFullYear() !== year
  ) {
    return 'Please enter a valid date';
  }
  return null;
}

const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({
  value,
  onChangeText,
  placeholder = 'DD/MM/YYYY',
  error,
  style,
  inputStyle,
  disabled = false,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (text: string) => {
    const formatted = formatDate(text);
    // Allow partial input
    onChangeText(formatted);
    // Only validate if full date
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(formatted)) {
      setLocalError(validateDate(formatted));
    } else {
      setLocalError(null);
    }
  };

  return (
    <View style={[styles.inputContainer, style]}>
      <SvgImage
        source={require('../../assets/svg/personalInfo/calendar.svg')}
        width={20}
        height={20}
        style={styles.inputIcon}
      />
      <TextInput
        style={[
          styles.input,
          styles.inputWithIcon,
          (error || localError) && styles.inputError,
          inputStyle,
        ]}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#C6C6C6"
        keyboardType="numeric"
        maxLength={10}
        editable={!disabled}
      />
      {(error || localError) ? <Text style={styles.errorText}>{error || localError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DFDFDF',
    borderRadius: 12,
    paddingHorizontal: 50,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FAFAFA',
    flex: 1,
    minHeight: 50,
  },
  inputWithIcon: {
    paddingLeft: 50,
    paddingRight: 20,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    position: 'absolute',
    left: 0,
    bottom: -18,
    color: '#FF4444',
    fontSize: 12,
  },
});

export default DateOfBirthInput; 