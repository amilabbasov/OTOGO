import React, { useRef, useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { Routes } from '../../../navigations/routes';
import useAuthStore from '../../../stores/auth/authStore';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { AuthScreenProps } from '../../../navigations/types';

const OTP_LENGTH = 6;
const RESEND_TIME = 90;

const PasswordResetOtpScreen = ({ navigation }: AuthScreenProps<Routes.passwordResetOtp>) => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  
  const { 
    verifyOtp,
    resendPasswordResetOtp,
    isLoading,
    error: authStoreError,
    tempEmail,
    otpResendState,
    resetPasswordResetOtpState,
    clearPasswordResetFlow, 
    passwordResetToken, 
  } = useAuthStore();

  const email = route.params?.email || tempEmail || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIME);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (otpResendState.isPasswordResetLockedOut && otpResendState.passwordResetLockoutUntil) {
      const now = Date.now();
      if (now < otpResendState.passwordResetLockoutUntil) {
        const remainingTime = Math.ceil((otpResendState.passwordResetLockoutUntil - now) / 1000);
        setLockoutTimer(remainingTime);
      } else {
        resetPasswordResetOtpState();
      }
    }
  }, [otpResendState.isPasswordResetLockedOut, otpResendState.passwordResetLockoutUntil, resetPasswordResetOtpState]);

  useEffect(() => {
    if (lockoutTimer !== null && lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev === null || prev <= 1) {
            resetPasswordResetOtpState();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer, resetPasswordResetOtpState]);

  useEffect(() => {
    if (timer === 0) {
      setIsResendDisabled(false);
      return;
    }
    setIsResendDisabled(true);
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (otpError) {
      setOtpError('');
    }

    if (value && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!isResendDisabled) {
      setOtpError('');
      try {
        await resendPasswordResetOtp(email);
        setTimer(RESEND_TIME);
        Alert.alert(t('Success'), t('OTP code resent successfully'));
      } catch (err: any) {
        const displayError = authStoreError || t('Failed to resend OTP code. Please try again.');
        setOtpError(displayError);
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    setOtpError('');

    if (otpCode.length !== OTP_LENGTH) {
      setOtpError(t('Please enter the complete OTP code'));
      return;
    }

    if (!otpCode || otpCode === '') {
      setOtpError(t('Please enter the OTP code'));
      return;
    }

    console.log("handleVerify: Attempting to verify OTP for password reset.", { 
      email, 
      otpCode, 
      isPasswordReset: true, 
      refreshTokenFromStore: passwordResetToken 
    });

    try {
      await verifyOtp({ 
        email, 
        token: otpCode, 
        isPasswordReset: true,
        refreshToken: passwordResetToken || '' 
      });
      
      setTimeout(() => {
        Alert.alert(t('Success'), t('OTP verified successfully. You can now reset your password.'));
        navigation.replace(Routes.resetPassword, { email, token: passwordResetToken || '' });
      }, 100);
      
    } catch (err: any) {
      const displayError = authStoreError || t('OTP code is wrong. Please try again.');
      setOtpError(displayError);
    }
  };

  const formatLockoutTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getResendAttemptsText = () => {
    const attemptsLeft = 5 - otpResendState.passwordResetResendAttempts;
    if (attemptsLeft <= 0) {
      return 'No password reset attempts remaining';
    }
    return `${attemptsLeft} password reset attempts remaining`;
  };

  const getResendButtonText = () => {
    if (otpResendState.isPasswordResetLockedOut && lockoutTimer !== null) {
      return `Password reset locked out (${formatLockoutTime(lockoutTimer)})`;
    }
    
    if (isResendDisabled) {
      return `${t('Resend Code')} (${String(timer).padStart(2, '0')})`;
    }
    return t('Resend Code');
  };

  const isResendButtonDisabled = isResendDisabled || isLoading || 
    (otpResendState.isPasswordResetLockedOut && lockoutTimer !== null);

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
              {/* Header Back Button */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.goBack();
                    clearPasswordResetFlow(); 
                  }}
                >
                  <SvgImage 
                    source={require('../../../assets/svg/auth/goBack.svg')}
                    width={40}
                    height={40}
                  />
                </TouchableOpacity>
              </View>

              {/* Screen Title and Subtitle */}
              <View style={styles.header}>
                <Text style={styles.title}>{t('Verify')}</Text>
                <Text style={styles.title}>{t('your email')}</Text>
                <Text style={styles.subtitle}>
                  {t('To reset your password, enter the 6 digit OTP code that we sent to your email.')}
                </Text>
              </View>

              {/* OTP Input Fields */}
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={ref => {
                      if (ref) {
                        inputRefs.current[idx] = ref;
                      }
                    }}
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null,
                      otpError ? styles.otpInputError : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={val => handleOtpChange(val, idx)}
                    onFocus={() => {
                      if (!otp[idx] && idx > 0 && !otp[idx - 1]) {
                        inputRefs.current[idx - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </View>
              {otpError || authStoreError ? (
                <Text style={styles.otpErrorText}>{otpError || authStoreError}</Text>
              ) : null}
              
              {/* Resend attempts info */}
              {otpResendState.passwordResetResendAttempts > 0 && (
                <View style={styles.attemptsContainer}>
                  <Text style={styles.attemptsText}>{getResendAttemptsText()}</Text>
                </View>
              )}

              {/* Lockout warning */}
              {otpResendState.isPasswordResetLockedOut && lockoutTimer !== null && (
                <View style={styles.lockoutContainer}>
                  <Text style={styles.lockoutText}>
                    Too many password reset attempts. Please wait {formatLockoutTime(lockoutTimer)} before trying again.
                  </Text>
                </View>
              )}

              <Text style={styles.didntGetText}>{t("Didn't get the code?")}</Text>
              <TouchableOpacity
                style={[styles.resendButton, isResendButtonDisabled && styles.resendButtonDisabled]}
                disabled={isResendButtonDisabled}
                onPress={handleResend}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#C0C0C0" />
                ) : (
                  <Text style={[styles.resendButtonText, isResendButtonDisabled && styles.resendButtonTextDisabled]}>
                    {getResendButtonText()}
                  </Text>
                )}
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
                onPress={handleVerify}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? t('Verifying...') : t('Verify')}
                </Text>
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    textAlign: 'center',
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  otpInputFilled: {
    borderColor: '#36F88D',
  },
  otpInputError: {
    borderColor: '#FF4444',
  },
  otpErrorText: {
    color: '#FF4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: -20,
    marginBottom: 20,
  },
  attemptsContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  attemptsText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  lockoutContainer: {
    backgroundColor: '#F8D7DA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
  },
  lockoutText: {
    color: '#721C24',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  didntGetText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 24,
  },
  resendButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  resendButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    color: '#C0C0C0',
  },
  verifyButton: {
    backgroundColor: '#D5FF5F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PasswordResetOtpScreen;