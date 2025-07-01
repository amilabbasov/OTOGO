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
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
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
              </View>

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
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    paddingTop: 20,
  },
  header: {
    marginBottom: 120,
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
  signInButton: {
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
  signInButtonText: {
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
  signUpButton: {
    backgroundColor: '#36F88D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#36F88D',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  linkText: {
    color: '#111',
    fontWeight: '700',
  },
});

export default RegisterScreen;