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
import { useNavigation } from '@react-navigation/native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../stores/auth/authStore';

type LoginScreenProps = AuthScreenProps<Routes.login>;

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginScreenProps['navigation']>();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage(t('Please fill in all fields.'));
      return;
    }

    const result = await login(email, password);

    if (!result.success) {
      setErrorMessage(result.message || t('Login failed'));
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(t('Forgot Password'), t('Password reset functionality coming soon'));
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

                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.signUpButtonText}>{t('Sign Up')}</Text>
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
                  <View style={styles.inputContainer}>
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
                      onChangeText={setEmail}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('Password')}</Text>
                  <View style={styles.inputContainer}>
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
                      onChangeText={setPassword}
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
                </View>

                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>{t('Forgot Password?')}</Text>
                </TouchableOpacity>

                {/* Xəta mesajı */}
                {errorMessage ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                ) : null}

                <TouchableOpacity 
                  style={[styles.loginButton, isLoading && styles.disabledButton]} 
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? t('Signing in...') : t('Sign In')}
                  </Text>
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
  signUpButton: {
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
  signUpButtonText: {
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
  errorContainer: {
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  errorText: {
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
});

export default LoginScreen; 