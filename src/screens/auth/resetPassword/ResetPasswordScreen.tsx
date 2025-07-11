import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import useAuthStore from '../../../stores/auth/authStore';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { colors } from '../../../theme/color';
import SuccessModal from '../../../components/success/SuccessModal';

const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthScreenProps<Routes.resetPassword>['navigation']>();
  // route.params-dan tokeni birbaşa götürmürük, çünki bu OTP kodu ola bilər.
  // const routeEmail = route.params?.email; // Bu hələ də faydalı ola bilər, amma əsas tempEmail-dir.
  // const routeToken = route.params?.token; // Bunu artıq istifadə etmirik

  const { updatePassword, isLoading, clearPasswordResetFlow, tempEmail, isOtpVerifiedForPasswordReset, passwordResetToken } = useAuthStore();
  
  const currentEmail = tempEmail;
  const currentToken = passwordResetToken;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    console.log('ResetPasswordScreen useEffect check:', { currentEmail, currentToken, isOtpVerifiedForPasswordReset });

    if (!currentEmail || !currentToken || !isOtpVerifiedForPasswordReset) {
      console.warn("ResetPasswordScreen: Email, token, or OTP verification state is missing. Redirecting to Forgot Password.");
      Alert.alert(
        t('Session expired or invalid'), 
        t('Please restart the password reset process.'),
        [
          { 
            text: t('OK'), 
            onPress: () => {
              clearPasswordResetFlow();
              navigation.replace(Routes.forgotPassword);
            }
          }
        ]
      );
    }
  }, [currentEmail, currentToken, isOtpVerifiedForPasswordReset, navigation, clearPasswordResetFlow, t]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!newPassword) {
      newErrors.newPassword = t('Password is required');
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('Password must be at least 6 characters');
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('Please confirm your password');
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('Passwords do not match');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!currentEmail || !currentToken) {
        Alert.alert(t('Error'), t('Email or token is missing. Please restart the process.'));
        clearPasswordResetFlow();
        navigation.replace(Routes.forgotPassword);
        return;
    }

    if (!validateForm()) return;
    
    try {
      await updatePassword({ email: currentEmail, token: currentToken, newPassword, repeatPassword: confirmPassword }); // <<<< currentToken istifadə edirik
      setShowSuccess(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || t('Failed to reset password. Please try again.');
      Alert.alert(t('Error'), errorMessage);
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Əgər dəyərlər yoxdursa, yükləmə göstərin və ya boş bir View qaytarın
  if (!currentEmail || !currentToken || !isOtpVerifiedForPasswordReset) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('Loading password reset flow...')}</Text>
      </View>
    );
  }

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
            <Text style={styles.title}>Reset{'\n'}Your Password</Text>
            
            <Text style={styles.subtitle}>
              Please enter your new password
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(text: string) => {
                    setNewPassword(text);
                    clearError('newPassword');
                  }}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <SvgImage 
                    source={showNewPassword 
                      ? require('../../../assets/svg/auth/eye-open-icon.svg')
                      : require('../../../assets/svg/auth/eye-closed-icon.svg')
                    } 
                    width={24} 
                    height={24} 
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(text: string) => {
                    setConfirmPassword(text);
                    clearError('confirmPassword');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <SvgImage 
                    source={showConfirmPassword 
                      ? require('../../../assets/svg/auth/eye-open-icon.svg')
                      : require('../../../assets/svg/auth/eye-closed-icon.svg')
                    } 
                    width={24} 
                    height={24} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? t('Resetting...') : t('Reset Password')}
              </Text>
            </TouchableOpacity>
          </View>
          <SuccessModal
            visible={showSuccess}
            message={t('Reset Password Success')}
            subMessage={t('Please re-login with your new password')}
            svgSource={require('../../../assets/svg/success/reset-success.svg')}
            onHide={() => {
              setShowSuccess(false);
              clearPasswordResetFlow();
              navigation.navigate(Routes.login);
            }}
          />
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
    paddingTop: 20,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    height: 56,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resetButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  loadingContainer: { // Yeni stil
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: { // Yeni stil
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default ResetPasswordScreen;