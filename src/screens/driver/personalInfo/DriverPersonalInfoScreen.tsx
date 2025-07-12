import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
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
import { toIsoDate } from '../../../utils/dateUtils';

const DriverPersonalInfoScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.personalInfo>['navigation']>();
  const route = useRoute<MainScreenProps<Routes.personalInfo>['route']>();
  const { completeProfile, isLoading, pendingProfileCompletion, setPendingProfileCompletionState, user } = useAuthStore();

  const email = route.params?.email || pendingProfileCompletion?.email || '';
  const userType = route.params?.userType || pendingProfileCompletion?.userType || 'driver';
  
  const [firstName, setFirstName] = useState(pendingProfileCompletion?.firstName || user?.name || '');
  const [lastName, setLastName] = useState(user?.surname || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.birthday ? new Date(user.birthday).toLocaleDateString('en-GB') : '');

  // Update form fields when user data changes
  React.useEffect(() => {
    if (user) {
      setFirstName(pendingProfileCompletion?.firstName || user.name || '');
      setLastName(user.surname || '');
      setPhone(user.phone || '');
      setDateOfBirth(user.birthday ? new Date(user.birthday).toLocaleDateString('en-GB') : '');
    }
  }, [user, pendingProfileCompletion?.firstName]);

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

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert(t('Error'), t('Please enter a valid phone number'));
      return false;
    }
    
    if (!dateOfBirth.trim()) {
      Alert.alert(t('Error'), t('Please enter your date of birth'));
      return false;
    }

    // Validate date format
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateOfBirth.trim())) {
      Alert.alert(t('Error'), t('Please enter date of birth in DD/MM/YYYY format'));
      return false;
    }

    // Validate date is reasonable
    const [day, month, year] = dateOfBirth.split('/').map(Number);
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      Alert.alert(t('Error'), t('Please enter a valid year of birth'));
      return false;
    }

    if (month < 1 || month > 12) {
      Alert.alert(t('Error'), t('Please enter a valid month'));
      return false;
    }

    if (day < 1 || day > 31) {
      Alert.alert(t('Error'), t('Please enter a valid day'));
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    const isoDate = toIsoDate(dateOfBirth);
    if (!isoDate) {
      Alert.alert(t('Error'), t('Please enter a valid date of birth in DD/MM/YYYY format'));
      return;
    }

    try {
      const authState = useAuthStore.getState();
      console.log('Auth state before completeProfile:', {
        isAuthenticated: authState.isAuthenticated,
        token: authState.token ? 'Exists' : 'Missing',
        userType: authState.userType,
        pendingProfileCompletion: authState.pendingProfileCompletion,
      });

      // Check if user already has the required information
      const hasExistingInfo = user && user.name && user.surname && user.phone && user.birthday;
      
      if (hasExistingInfo) {
        // User already has complete profile, just advance to next step
        console.log('DriverPersonalInfoScreen: User already has complete profile, advancing to next step');
        setPendingProfileCompletionState({
          ...pendingProfileCompletion,
          step: 'serviceSelection',
        });
        return;
      }

      const result = await completeProfile(
        email, 
        firstName.trim(), 
        lastName.trim(), 
        phone.trim(),
        userType,
        isoDate,
      );
      
      console.log('DriverPersonalInfoScreen: completeProfile result:', result);
      
      if (result.success) {
        console.log('DriverPersonalInfoScreen: Profile completion successful');
        // The completeProfile function already sets the pendingProfileCompletion state
        // No need to call setPendingProfileCompletionState again
      } else {
        console.log('DriverPersonalInfoScreen: Profile completion failed:', result.message);
        Alert.alert(t('Error'), result.message || t('Failed to complete profile'));
      }
    } catch (error: any) {
      console.error('Profile completion error:', error);
      const errorMessage = error.message || t('Failed to complete profile');
      Alert.alert(t('Error'), errorMessage);
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
                {isLoading ? 'Saving...' : 'Next'}
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
