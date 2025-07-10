import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import useAuthStore from '../../../stores/auth/authStore';
import { useTranslation } from 'react-i18next';

const ForgotPasswordScreen = ({ navigation }: AuthScreenProps<Routes.forgotPassword>) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { forgotPassword, isLoading, error: authStoreError } = useAuthStore();

  const handleSendResetLink = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError(t('Please enter your email address'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError(t('Please enter a valid email address'));
      return;
    }

    try {
      await forgotPassword(email.trim());

      console.log('DEBUG: forgotPassword call SUCCEEDED in ForgotPasswordScreen.');

      Alert.alert(
        t('Success'),
        t('Password reset code has been sent to your email.'),
        [{
          text: t('OK'),
          onPress: () => {
            console.log('DEBUG: Alert OK button pressed. NO navigation needed, AuthRouter handles it.');
          }
        }]
      );
    } catch (error: any) {
      const errorMessage = authStoreError || t('Failed to send reset instructions. Please try again.');
      setEmailError(errorMessage);
    }
  };

  const handleNeedHelp = () => {

  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <SvgImage
                source={require('../../../assets/svg/auth/goBack.svg')}
                width={40}
                height={40}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{t('Forgot Your Password?')}</Text>

            <Text style={styles.subtitle}>
              {t('Please enter your email to send the OTP verification to reset your password')}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('Email')}</Text>
              <View style={[styles.emailInputContainer, emailError && styles.emailInputError]}>
                <TextInput
                  style={styles.emailInput}
                  placeholder={t('Enter your email')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleSendResetLink}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.signInButtonText}>
                  {t('Send reset code')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.needHelpButton}
              onPress={handleNeedHelp}
            >
              <Text style={styles.needHelpText}>{t('Need Help?')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    lineHeight: 24,
    marginBottom: 60,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: '#666',
    marginBottom: 10,
  },
  emailInputContainer: {
    borderWidth: 1,
    borderColor: '#DFDFDF',
    borderRadius: 12,
  },
  emailInputError: {
    borderColor: '#FF4444',
  },
  emailInput: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 14,
    fontWeight: '400',
    color: '#14151A',
  },
  signInButton: {
    backgroundColor: '#D5FF5F',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  signInButtonDisabled: {
    backgroundColor: '#B3B3B3',
    opacity: 0.7,
  },
  signInButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  needHelpButton: {
    alignItems: 'center',
  },
  needHelpText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '400',
  },
});

export default ForgotPasswordScreen;