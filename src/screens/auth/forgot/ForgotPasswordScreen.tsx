import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';

const ForgotPasswordScreen = ({ navigation }: AuthScreenProps<Routes.forgotPassword>) => {
  const [email, setEmail] = useState('');

  const handleSendResetLink = () => {
    console.log('Email:', email);
  };

  const handleNeedHelp = () => {
    console.log('Need help pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
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
          style={styles.signInButton}
          onPress={handleSendResetLink}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        {/* Need Help */}
        <TouchableOpacity 
          style={styles.needHelpButton}
          onPress={handleNeedHelp}
        >
          <Text style={styles.needHelpText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    marginBottom: 40,
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