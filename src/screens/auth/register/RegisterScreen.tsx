import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { useTranslation } from 'react-i18next';

type RegisterScreenProps = AuthScreenProps<Routes.register>;

const RegisterScreen: React.FC<RegisterScreenProps> = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RegisterScreenProps['navigation']>();
  const route = useRoute<RegisterScreenProps['route']>();
  const { userType } = route.params;

  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const handleSignUp = () => {
    if (!number || !password || !rePassword) {
      Alert.alert(t('Error'), t('Please fill in all fields.'));
      return;
    }
    if (password !== rePassword) {
      Alert.alert(t('Error'), t('Passwords do not match.'));
      return;
    }

    console.log('Registering with:', { number, password, userType });

    const rootNavigation = navigation.getParent();
    rootNavigation?.reset({
      index: 0,
      routes: [
        {
          name: Routes.main,
          params: { screen: userType === 'provider' ? Routes.providerTabs : Routes.customerTabs },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t('Sign Up')}</Text>
          <Text style={styles.subtitle}>{t('Create your new account')}</Text>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate(Routes.login)}
          >
            <Text style={styles.signInButtonText}>{t('Sign In')}</Text>
            <SvgImage
              source={require('../../../assets/svg/onboarding/circle-arrow-right.svg')}
              width={16}
              height={16}
              color="#111"
            />
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('Number')}</Text>
            <View style={styles.inputContainer}>
              <SvgImage
                source={require('../../../assets/svg/auth/phone-icon.svg')}
                width={20}
                height={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('Enter your number')}
                keyboardType="phone-pad"
                value={number}
                onChangeText={setNumber}
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
                style={styles.input}
                placeholder={t('Enter your password')}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <SvgImage
                  source={
                    showPassword
                      ? require('../../../assets/svg/auth/eye-closed-icon.svg')
                      : require('../../../assets/svg/auth/eye-closed-icon.svg')
                  }
                  width={20}
                  height={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('Re-Password')}</Text>
            <View style={styles.inputContainer}>
              <SvgImage
                source={require('../../../assets/svg/auth/lock-icon.svg')}
                width={20}
                height={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t('Enter your password')}
                secureTextEntry={!showRePassword}
                value={rePassword}
                onChangeText={setRePassword}
              />
              <TouchableOpacity onPress={() => setShowRePassword(!showRePassword)} style={styles.eyeIcon}>
                <SvgImage
                  source={
                    showRePassword
                      ? require('../../../assets/svg/auth/eye-closed-icon.svg')
                      : require('../../../assets/svg/auth/eye-closed-icon.svg')
                  }
                  width={20}
                  height={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>{t('Sign Up')}</Text>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 40,
    gap: 8, // Icon və mətn arasındakı boşluq
  },
  signInButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56, // Şəkildəki hündürlük
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Düzgün yerləşdirmə üçün
  },
  eyeIcon: {
    paddingLeft: 12,
  },
  signUpButton: {
    backgroundColor: '#22C55E', // Şəkildəki yaşıl rəng
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18, // Sətirlər arasındakı boşluq
  },
  linkText: {
    color: '#22C55E', // Link rəngi
    fontWeight: '600',
  },
});

export default RegisterScreen;