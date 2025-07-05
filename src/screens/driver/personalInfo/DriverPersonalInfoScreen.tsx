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
import { useAuthStore } from '../../../stores/auth/authStore';
import { colors } from '../../../theme/color';
import { SvgImage } from '../../../components/svgImage/SvgImage';

const DriverPersonalInfoScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.personalInfo>['navigation']>();
  const route = useRoute<MainScreenProps<Routes.personalInfo>['route']>();
  const { completeProfile, isLoading, pendingProfileCompletion, clearAuth } = useAuthStore();
  
  // Get email and userType from route params or pending profile completion
  const email = route.params?.email || pendingProfileCompletion?.email || '';
  const userType = route.params?.userType || pendingProfileCompletion?.userType || 'driver';
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleDateChange = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as DD/MM/YYYY
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
    
    // Limit to DD/MM/YYYY format (10 characters)
    if (formatted.length <= 10) {
      setDateOfBirth(formatted);
    }
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert(t('Error'), t('Please enter your first name'));
      return false;
    }
    
    if (!lastName.trim()) {
      Alert.alert(t('Error'), t('Please enter your last name'));
      return false;
    }
    
    if (!dateOfBirth.trim()) {
      Alert.alert(t('Error'), t('Please enter your date of birth'));
      return false;
    }

    // Validate date format (DD/MM/YYYY)
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateOfBirth.match(dateRegex);
    
    if (!match) {
      Alert.alert(t('Error'), t('Please enter date in DD/MM/YYYY format'));
      return false;
    }

    const [, day, month, year] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    const currentYear = new Date().getFullYear();

    if (dayNum < 1 || dayNum > 31) {
      Alert.alert(t('Error'), t('Please enter a valid day (01-31)'));
      return false;
    }

    if (monthNum < 1 || monthNum > 12) {
      Alert.alert(t('Error'), t('Please enter a valid month (01-12)'));
      return false;
    }

    if (yearNum < 1900 || yearNum > currentYear) {
      Alert.alert(t('Error'), t('Please enter a valid year'));
      return false;
    }

    // Check if it's a valid date
    const testDate = new Date(yearNum, monthNum - 1, dayNum);
    if (testDate.getDate() !== dayNum || testDate.getMonth() !== monthNum - 1 || testDate.getFullYear() !== yearNum) {
      Alert.alert(t('Error'), t('Please enter a valid date'));
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    // For drivers, pass birthday and use default modelId 1 (car selection commented out for now)
    const result = await completeProfile(
      email, 
      firstName.trim(), 
      lastName.trim(), 
      '', // Empty phone for drivers
      userType,
      dateOfBirth || new Date().toISOString().split('T')[0], // Use entered date or today's date
      1 // Default modelId - car selection commented out for now
    );
    
    if (result.success) {
      // Complete registration directly - car selection commented out
      Alert.alert(
        t('Success'), 
        t('Profile completed successfully! Welcome to OTOGO.'),
        [
          {
            text: t('OK'),
            onPress: () => {
              // Navigate directly to driver tabs - car selection skipped
              navigation.navigate(Routes.driverTabs);
            }
          }
        ]
      );
    } else {
      console.log('Profile completion failed:', result.message);
      
      // Check if this is a "User not found" error that requires re-registration
      if (result.message && result.message.includes('not found')) {
        Alert.alert(
          t('Registration Required'), 
          t('Your account was not found. This may happen if there was an issue during registration. Please try registering again with OTP verification.'),
          [
            {
              text: t('Go to Registration'),
              onPress: () => {
                // Clear auth state and navigate to registration
                clearAuth();
                // Since we're in the driver flow, we'll clear auth which will redirect to auth router
                // The auth router will show the login screen, and user can navigate to registration from there
              }
            },
            {
              text: t('Try Again'),
              onPress: () => {
                // Stay on current screen to allow user to retry
                console.log('User chose to retry profile completion');
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
                console.log('Profile completion error acknowledged by user');
              }
            }
          ]
        );
      }
    }
  };

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
                  <Text style={styles.label}>Date of birth*</Text>
                  <View style={styles.inputContainer}>
                    <SvgImage
                      source={require('../../../assets/svg/personalInfo/calendar.svg')}
                      width={20}
                      height={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.inputWithIcon]}
                      value={dateOfBirth}
                      onChangeText={handleDateChange}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#C6C6C6"
                      keyboardType="numeric"
                      maxLength={10}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={{ flex: 1, marginBottom: 20 }} />

            <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
              onPress={handleContinue} 
              activeOpacity={0.8}
              disabled={isLoading}
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
