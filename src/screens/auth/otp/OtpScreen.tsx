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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

const OTP_LENGTH = 6;
const RESEND_TIME = 59;

const OtpScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIME);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = useRef<(TextInput | null)[]>([]);

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
    if (value && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!isResendDisabled) {
      setTimer(RESEND_TIME);
    }
  };

  const handleVerify = () => {
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <View style={styles.innerContent}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('Verify')}</Text>
                <Text style={styles.title}>{t('your number')}</Text>
                <Text style={styles.subtitle}>
                  {t('To verify your account, enter the 6 digit OTP code that we sent to your number.')}
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
                      inputRefs.current[idx]?.isFocused?.() ? styles.otpInputFocused : null,
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
              <Text style={styles.didntGetText}>{t("Didn't get the code?")}</Text>
              <TouchableOpacity
                style={[styles.resendButton, isResendDisabled && styles.resendButtonDisabled]}
                disabled={isResendDisabled}
                onPress={handleResend}
              >
                <Text style={[styles.resendButtonText, isResendDisabled && styles.resendButtonTextDisabled]}>
                  {t('Resend Code')} {isResendDisabled ? `(${String(timer).padStart(2, '0')})` : ''}
                </Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerify} activeOpacity={0.8}>
                <Text style={styles.verifyButtonText}>{t('Verify')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={() => { navigation.goBack() }}>
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
    marginTop: 16,
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
  otpInputFocused: {
    borderColor: '#36F88D',
  },
  otpInputFilled: {
    borderColor: '#36F88D',
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