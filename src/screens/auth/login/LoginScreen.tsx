import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { LanguageSelector } from '../../../components/languageSelector/LanguageSelector';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../../stores/auth/authStore';

type LoginScreenProps = AuthScreenProps<Routes.login>;

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenProps['navigation']>();
  
  const { login, isLoading, error, clearError } = useAuthStore(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const validateForm = () => {
    const errors: { email?: string; password?: string; general?: string } = {};
    
    if (!email.trim()) {
      errors.email = t('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('Please enter a valid email address');
    }
    
    if (!password.trim()) {
      errors.password = t('Password is required');
    }
    // else if (password.length < 6) {
    //   errors.password = t('Password must be at least 6 characters');
    // }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: 'email' | 'password') => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (error) {
      setFieldErrors({ general: error });
    } else {
      setFieldErrors({});
    }
  }, [error]);

  const handleLogin = async () => {
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    await login({ email: email.trim(), password });
  };

  const handleForgotPassword = () => {
    navigation.navigate(Routes.forgotPassword);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
          >
            <View style={styles.innerContent}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('Sign In')}</Text>
                <Text style={styles.subtitle}>{t('Welcome back to your account')}</Text>
                <View style={styles.languageSelectorContainer}>
                  <LanguageSelector />
                </View>
              </View>

              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('Email')}</Text>
                  <View style={[styles.inputContainer, fieldErrors.email && styles.inputError]}>
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
                      onChangeText={(text) => {
                        setEmail(text);
                        clearFieldError('email');
                      }}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                  </View>
                  {fieldErrors.email && (
                    <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('Password')}</Text>
                  <View style={[styles.inputContainer, fieldErrors.password && styles.inputError]}>
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
                      onChangeText={(text) => {
                        setPassword(text);
                        clearFieldError('password');
                      }}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
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
                  {fieldErrors.password && (
                    <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                  )}
                </View>

                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>{t('Forgot Password?')}</Text>
                </TouchableOpacity>

                {fieldErrors.general && (
                  <View style={styles.generalErrorContainer}>
                    <Text style={styles.generalErrorText}>{fieldErrors.general}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.loginButtonText}>{t('Sign In')}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={() => navigation.navigate(Routes.onboardingPager)}
                >
                  <Text style={styles.signUpButtonText}>{t('Are you new to Otogo?')}</Text>
                  <SvgImage
                    source={require('../../../assets/svg/onboarding/circle-arrow-right.svg')}
                    width={20}
                    height={20}
                    color="#D5FF5F"
                  />
                </TouchableOpacity>
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
    marginTop: 20,
  },
  languageSelectorContainer: {
    marginBottom: 24,
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
  signUpButton: {
    flexDirection: 'row',
    backgroundColor: '#14151A',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  signUpButtonText: {
    color: '#D5FF5F',
    fontSize: 14,
    fontWeight: '500',
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '500',
  },
  fieldErrorText: {
    color: '#CC0000',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    marginLeft: 4,
  },
  generalErrorContainer: {
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  generalErrorText: {
    color: '#CC0000',
    fontSize: 14,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#D5FF5F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  loginButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 1,
  },
});

export default LoginScreen;