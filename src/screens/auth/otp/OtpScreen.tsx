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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import useAuthStore from '../../../stores/auth/authStore';
import { UserType } from '../../../types/common';
import SuccessModal from '../../../components/success/SuccessModal';

const OTP_LENGTH = 6;
const RESEND_TIME = 10;

type OtpRouteParams = {
  email: string;
  userType?: UserType;
};

const OtpScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<AuthScreenProps<Routes.otp>['route']>();

  const {
    verifyOtp,
    resendOtp,
    isLoading,
    error: authStoreError,
    pendingProfileCompletion,
    tempEmail,
    userType: storeUserType,
    otpResendState,
    resetOtpResendState,
  } = useAuthStore();

  // Get email and userType from route params or auth store
  const routeParams = route.params as OtpRouteParams;
  const email = routeParams?.email || pendingProfileCompletion.email || tempEmail || '';
  const userType = routeParams?.userType || pendingProfileCompletion.userType || storeUserType;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIME);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [otpError, setOtpError] = useState('');
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check lockout status on component mount
  useEffect(() => {
    if (otpResendState.isLockedOut && otpResendState.lockoutUntil) {
      const now = Date.now();
      if (now < otpResendState.lockoutUntil) {
        const remainingTime = Math.ceil((otpResendState.lockoutUntil - now) / 1000);
        setLockoutTimer(remainingTime);
      } else {
        // Lockout has expired, reset the state
        resetOtpResendState();
      }
    }
  }, [otpResendState.isLockedOut, otpResendState.lockoutUntil, resetOtpResendState]);

  // Handle lockout timer countdown
  useEffect(() => {
    if (lockoutTimer !== null && lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev === null || prev <= 1) {
            resetOtpResendState();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer, resetOtpResendState]);

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
    console.log("handleResend: Starting resend process.");
    console.log("handleResend: Current email:", email); // ƏLAVƏ EDİN
    console.log("handleResend: Current userType:", userType); // ƏLAVƏ EDİN
    console.log("handleResend: isResendDisabled:", isResendDisabled); // ƏLAVƏ EDİN
    console.log("handleResend: isLoading (from store):", isLoading); // ƏLAVƏ EDİN
    console.log("handleResend: otpResendState.isLockedOut:", otpResendState.isLockedOut); // ƏLAVƏ EDİN
    console.log("handleResend: lockoutTimer:", lockoutTimer); // ƏLAVƏ EDİN

    if (!isResendDisabled) {
      setOtpError('');
      try {
        if (userType) {
          await resendOtp(email, userType);
        } else {
          setOtpError(t('Failed to resend OTP code: User type is missing.'));
          return;
        }
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

    try {
      if (userType) {
        await verifyOtp({ email, token: otpCode, userType: userType as UserType });
        setShowSuccess(true);
      } else {
        setOtpError(t('An error occurred. Please try again. Missing user type.'));
      }
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
    const attemptsLeft = 5 - otpResendState.resendAttempts;
    if (attemptsLeft <= 0) {
      return 'No attempts remaining';
    }
    return `${attemptsLeft} attempts remaining`;
  };

  const getResendButtonText = () => {
    if (otpResendState.isLockedOut && lockoutTimer !== null) {
      return `Locked out (${formatLockoutTime(lockoutTimer)})`;
    }

    if (isResendDisabled) {
      return `${t('Resend Code')} (${String(timer).padStart(2, '0')})`;
    }
    return t('Resend Code');
  };

  const isResendButtonDisabled = isResendDisabled || isLoading ||
    (otpResendState.isLockedOut && lockoutTimer !== null);

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
                <Text style={styles.title}>{t('Verify')}</Text>
                <Text style={styles.title}>{t('your email')}</Text>
                <Text style={styles.subtitle}>
                  {t('To verify your account, enter the 6 digit OTP code that we sent to your email.')}
                </Text>
              </View>
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
              {otpResendState.resendAttempts > 0 && (
                <View style={styles.attemptsContainer}>
                  <Text style={styles.attemptsText}>{getResendAttemptsText()}</Text>
                </View>
              )}

              {/* Lockout warning */}
              {otpResendState.isLockedOut && lockoutTimer !== null && (
                <View style={styles.lockoutContainer}>
                  <Text style={styles.lockoutText}>
                    Too many resend attempts. Please wait {formatLockoutTime(lockoutTimer)} before trying again.
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
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    useAuthStore.getState().clearAuth();
                  }
                }}
              >
                <Text style={styles.backButtonText}>{t('Back')}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          <SuccessModal
            visible={showSuccess}
            message={t('Number verification success!!')}
            svgSource={require('../../../assets/svg/success/verification-success.svg')}
            onHide={() => {
              setShowSuccess(false);
              navigation.reset({ index: 0, routes: [{ name: Routes.driverHome as never }] });
            }}
          />
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

export default OtpScreen; 