import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import { useAuthStore } from '../../../stores/auth/authStore';

const PersonalInfoScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthScreenProps<Routes.personalInfo>['navigation']>();
  const route = useRoute<AuthScreenProps<Routes.personalInfo>['route']>();
  const { email, userType } = route.params;
  const { completeProfile, isLoading } = useAuthStore();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleContinue = async () => {
    if (!firstName.trim()) {
      Alert.alert(t('Error'), t('Please enter your first name'));
      return;
    }
    
    if (!lastName.trim()) {
      Alert.alert(t('Error'), t('Please enter your last name'));
      return;
    }
    
    if (!phone.trim()) {
      Alert.alert(t('Error'), t('Please enter your phone number'));
      return;
    }

    const result = await completeProfile(email, firstName.trim(), lastName.trim(), phone.trim(), userType);
    
    if (result.success) {
      Alert.alert(
        t('Success'), 
        t('Profile completed successfully! Welcome to the app.'),
        [
          {
            text: t('OK'),
            onPress: () => {
              // User is now fully authenticated and will be redirected to main app
              // The Router component will handle this automatically
            }
          }
        ]
      );
    } else {
      Alert.alert(t('Error'), result.message || t('Failed to complete profile'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          >
            <View style={styles.innerContent}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('Personal')}</Text>
                <Text style={styles.title}>{t('Information')}</Text>
                <Text style={styles.subtitle}>
                  {t('Please provide your personal information to complete your profile.')}
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('First Name')}</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder={t('Enter your first name')}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    autoComplete="given-name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('Last Name')}</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder={t('Enter your last name')}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    autoComplete="family-name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('Phone Number')}</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder={t('Enter your phone number')}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />
                </View>
              </View>

              <View style={{ flex: 1 }} />

              <TouchableOpacity 
                style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
                onPress={handleContinue} 
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>
                  {isLoading ? t('Saving...') : t('Continue')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>{t('Back')}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    marginBottom: 0,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 16,
    marginBottom: 32,
    fontWeight: '400',
    lineHeight: 21,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: '#D5FF5F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  backButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PersonalInfoScreen;
