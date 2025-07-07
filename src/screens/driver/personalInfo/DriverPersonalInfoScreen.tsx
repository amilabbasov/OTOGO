import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import useAuthStore from '../../../stores/auth/authStore';
import { colors } from '../../../theme/color';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import DateOfBirthInput from '../../../components/registration/DateOfBirthInput';

const DriverPersonalInfoScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.personalInfo>['navigation']>();
  const route = useRoute<MainScreenProps<Routes.personalInfo>['route']>();
  const { completeProfile, isLoading, pendingProfileCompletion, clearAuth } = useAuthStore();
  
  const email = route.params?.email || pendingProfileCompletion?.email || '';
  const userType = route.params?.userType || pendingProfileCompletion?.userType || 'driver';
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert(t('Error'), t('Please enter your first name'));
      return false;
    }
    
    if (!lastName.trim()) {
      Alert.alert(t('Error'), t('Please enter your last name'));
      return false;
    }
    
    if (!phone.trim()) {
      Alert.alert(t('Error'), t('Please enter your phone number'));
      return false;
    }
    
    if (!dateOfBirth.trim()) {
      Alert.alert(t('Error'), t('Please enter your date of birth'));
      return false;
    }

    return true;
  };

  function toIsoDate(date: string) {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  const handleContinue = async () => {
    if (!validateForm()) return;
    const isoDate = toIsoDate(dateOfBirth);
    const result = await completeProfile(
      email, 
      firstName.trim(), 
      lastName.trim(), 
      phone.trim(),
      userType,
      isoDate || new Date().toISOString().split('T')[0],
    );
    
    if (result.success) {


    } else {
      
      
      if (result.message && result.message.includes('not found')) {
        Alert.alert(
          t('Registration Required'), 
          t('Your account was not found. This may happen if there was an issue during registration. Please try registering again with OTP verification.'),
          [
            {
              text: t('Go to Registration'),
              onPress: () => {
                clearAuth();
              }
            },
            {
              text: t('Try Again'),
              onPress: () => {
            
              },
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert(
          t('Error'), 
          result.message || t('Failed to complete profile. Please try again.'),
          [
            {
              text: t('OK'),
              onPress: () => {
            
              }
            }
          ]
        );
      }
    }
  };

  const hasRequiredFields = firstName.trim() && lastName.trim() && phone.trim() && dateOfBirth.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.innerContent}>
            <View style={styles.contentPadding}>
              <View style={styles.header}>
                <Text style={styles.title}>Driver</Text>
                <Text style={styles.title}>Information</Text>
                <Text style={styles.subtitle}>
                  Please fill in your personal information to complete your driver profile
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.nameRow}>
                  <View style={styles.nameInputGroup}>
                    <Text style={styles.label}>First name*</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Enter your first name"
                      placeholderTextColor="#C6C6C6"
                      autoCapitalize="words"
                      autoComplete="given-name"
                    />
                  </View>
                  
                  <View style={styles.nameInputGroup}>
                    <Text style={styles.label}>Last name*</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter your last name"
                      placeholderTextColor="#C6C6C6"
                      autoCapitalize="words"
                      autoComplete="family-name"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail*</Text>
                  <View style={styles.inputContainer}>
                    <SvgImage
                      source={require('../../../assets/svg/personalInfo/email.svg')}
                      width={20}
                      height={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.inputWithIcon]}
                      value={email}
                      placeholder="Enter your email"
                      placeholderTextColor="#C6C6C6"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone number*</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.input, styles.inputWithIcon]}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#C6C6C6"
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date of birth*</Text>
                  <DateOfBirthInput
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="DD/MM/YYYY"
                  />
                </View>
              </View>
            </View>

            <View style={{ flex: 1, marginBottom: 20 }} />

            <TouchableOpacity 
              style={[styles.continueButton, (!hasRequiredFields || isLoading) && styles.continueButtonDisabled]} 
              onPress={handleContinue} 
              activeOpacity={0.8}
              disabled={!hasRequiredFields || isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? 'Saving...' : 'Complete Registration'}
              </Text>
              <Text style={styles.continueButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  contentPadding: {
    paddingHorizontal: 10,
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
    marginBottom: 0,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: '#14151A',
    marginTop: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  nameInputGroup: {
    flex: 1,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#14151A',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DFDFDF',
    borderRadius: 12,
    paddingHorizontal: 20,
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
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#B3B3B3',
    color: '#fff',
  },
  continueButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  continueButtonArrow: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DriverPersonalInfoScreen;
