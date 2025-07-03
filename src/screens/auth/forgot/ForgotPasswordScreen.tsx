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
  Alert
} from 'react-native';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import { useAuthStore } from '../../../stores/auth/authStore';

const ForgotPasswordScreen = ({ navigation }: AuthScreenProps<Routes.forgotPassword>) => {
  const [email, setEmail] = useState('');
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const result = await forgotPassword(email.trim());

    if (result.success) {

      navigation.navigate(Routes.otp, { 
        email: email.trim(), 
        isPasswordReset: true 
      });
    } else {
      Alert.alert('Error', result.message || 'Failed to send reset instructions. Please try again.');
    }
  };

  const handleNeedHelp = () => {
    console.log('Need help pressed');
    // You can add help/support functionality here
  };

  // Note: The second API endpoint /api/passwords/reset would be used in a separate screen
  // where the user enters the token they received via email along with their new password:
  // {
  //   "email": "string",
  //   "token": "string", 
  //   "newPassword": "string",
  //   "repeatPassword": "string"
  // }

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
            <Text style={styles.title}>Forgot{'\n'}Your Password?</Text>
            
            <Text style={styles.subtitle}>
              Please enter your email to send the OTP verification to reset your password
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.emailInputContainer}>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              onPress={handleSendResetLink}
              disabled={isLoading}
            >
              <Text style={styles.signInButtonText}>
                {isLoading ? 'Sending...' : 'Send reset code'}
              </Text>
            </TouchableOpacity>

            {/* Need Help */}
            <TouchableOpacity 
              style={styles.needHelpButton}
              onPress={handleNeedHelp}
            >
              <Text style={styles.needHelpText}>Need Help?</Text>
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
});

export default ForgotPasswordScreen;