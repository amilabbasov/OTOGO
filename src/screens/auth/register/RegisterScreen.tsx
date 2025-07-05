import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../stores/auth/authStore';

type RegisterScreenProps = AuthScreenProps<Routes.register>;

const RegisterScreen: React.FC<RegisterScreenProps> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RegisterScreenProps['navigation']>();
  const route = useRoute<RegisterScreenProps['route']>();
  const { userType } = route.params;
  const { signup, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rePasswordError, setRePasswordError] = useState('');

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const rePasswordInputRef = useRef<TextInput>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError(t('Email is invalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('');
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(t('Password must be minimum 8 characters long and contain letters A-Z, a-z, numbers and at least one special character.'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateRePassword = (rePassword: string) => {
    if (!rePassword) {
      setRePasswordError('');
      return false;
    }
    if (password !== rePassword) {
      setRePasswordError(t('Passwords do not match.'));
      return false;
    }
    setRePasswordError('');
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
    if (rePassword) {
      validateRePassword(rePassword);
    }
  };

  const handleRePasswordChange = (text: string) => {
    setRePassword(text);
    validateRePassword(text);
  };

  const handleSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!userType) {
      setErrorMessage(t('User type is required. Please go back and select your account type.'));
      return;
    }

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isRePasswordValid = validateRePassword(rePassword);

    if (!email || !password || !rePassword) {
      setErrorMessage(t('Please fill in all fields.'));
      return;
    }

    if (!isEmailValid || !isPasswordValid || !isRePasswordValid) {
      setErrorMessage(t('Please fix the errors above.'));
      return;
    }

    try {
      const result = await signup(email, password, rePassword, userType);

      if (result.success) {
        setSuccessMessage(t('Registration successful! Please check your email for the OTP code.'));
        setTimeout(() => {
          navigation.navigate(Routes.otp, { email, userType });
        }, 1000);
      } else {
        setErrorMessage(result.message || t('Registration failed. Please try again.'));
      }
    } catch (error: any) {
      setErrorMessage(t('An unexpected error occurred. Please try again.'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={styles.innerContent}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('Sign Up')}</Text>
                <Text style={styles.subtitle}>{t('Create your new account')}</Text>

                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.signInButtonText}>{t('Sign In')}</Text>
                  <SvgImage
                    source={require('../../../assets/svg/onboarding/circle-arrow-right.svg')}
                    width={16}
                    height={16}
                    color="#111"
                  />
                </TouchableOpacity>
              </View>

              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('Email')}</Text>
                  <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                    <SvgImage
                      source={require('../../../assets/svg/auth/phone-icon.svg')}
                      width={20}
                      height={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={emailInputRef}
                      style={styles.input}
                      placeholder={t('Enter your email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={handleEmailChange}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.fieldErrorText}>{emailError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('Password')}</Text>
                  <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
                    <SvgImage
                      source={require('../../../assets/svg/auth/lock-icon.svg')}
                      width={20}
                      height={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.input}
                      placeholder={t('Enter your password')}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={handlePasswordChange}
                      returnKeyType="next"
                      onSubmitEditing={() => rePasswordInputRef.current?.focus()}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <SvgImage
                        source={
                          showPassword
                            ? require('../../../assets/svg/auth/eye-open-icon.svg')
                            : require('../../../assets/svg/auth/eye-closed-icon.svg')
                        }
                        width={20}
                        height={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text style={styles.fieldErrorText}>{passwordError}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('Re-Password')}</Text>
                  <View style={[styles.inputContainer, rePasswordError && styles.inputContainerError]}>
                    <SvgImage
                      source={require('../../../assets/svg/auth/lock-icon.svg')}
                      width={20}
                      height={20}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={rePasswordInputRef}
                      style={styles.input}
                      placeholder={t('Enter your password')}
                      secureTextEntry={!showRePassword}
                      value={rePassword}
                      onChangeText={handleRePasswordChange}
                      returnKeyType="done"
                      onSubmitEditing={handleSignUp}
                    />
                    <TouchableOpacity onPress={() => setShowRePassword(!showRePassword)} style={styles.eyeIcon}>
                      <SvgImage
                        source={
                          showRePassword
                            ? require('../../../assets/svg/auth/eye-open-icon.svg')
                            : require('../../../assets/svg/auth/eye-closed-icon.svg')
                        }
                        width={20}
                        height={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  {rePasswordError ? (
                    <Text style={styles.fieldErrorText}>{rePasswordError}</Text>
                  ) : null}
                </View>

                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                {successMessage ? (
                  <View style={styles.successContainer}>
                    <Text style={styles.successText}>{successMessage}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && styles.disabledButton]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                >
                  <Text style={styles.signUpButtonText}>
                    {isLoading ? t('Signing up...') : t('Sign Up')}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  {t('By selecting Sign Up, I agree to ')}
                  <Text style={styles.linkText} onPress={() => Alert.alert(t('Terms of Service'))}>
                    {t('Terms of Service')}
                  </Text>
                  {t(' and ')}
                  <Text style={styles.linkText} onPress={() => Alert.alert(t('Privacy Policy'))}>
                    {t('Privacy Policy')}
                  </Text>
                </Text>
              </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
    fontWeight: '400',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginBottom: 40,
    gap: 6,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '400',
    marginRight: 4,
  },
  inputGroup: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: '#888',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  inputContainerError: {
    borderColor: '#FF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    paddingLeft: 12,
  },
  fieldErrorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  errorText: {
    color: '#CC0000',
    fontSize: 14,
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  successText: {
    color: '#047857',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: '#D5FF5F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#36F88D',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  linkText: {
    color: '#111',
    fontWeight: '700',
  },
});

export default RegisterScreen;
