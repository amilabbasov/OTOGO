import React, { useState } from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import useAuthStore from '../../../stores/auth/authStore';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { colors } from '../../../theme/color';
import { metrics } from '../../../theme/metrics';

const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<AuthScreenProps<Routes.resetPassword>['navigation']>();
  const route = useRoute<AuthScreenProps<Routes.resetPassword>['route']>();
  const { email, token } = route.params;
  const { updatePassword, isLoading, clearPasswordResetFlow } = useAuthStore();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
    if (!validateForm()) return;
    
    try {
      await updatePassword({ email, token, newPassword, repeatPassword: confirmPassword });
      Alert.alert(
        t('Success'),
        t('Password has been reset successfully'),
        [
          {
            text: t('OK'),
            onPress: () => {
              clearPasswordResetFlow();
              navigation.navigate(Routes.login);
            }
          },
        ]
      );
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
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

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Reset{'\n'}Your Password</Text>
            
            <Text style={styles.subtitle}>
              Please enter your new password
            </Text>

            {/* New Password Input */}
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

            {/* Confirm Password Input */}
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

            {/* Reset Password Button */}
            <TouchableOpacity 
              style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Text>
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
});

export default ResetPasswordScreen;
