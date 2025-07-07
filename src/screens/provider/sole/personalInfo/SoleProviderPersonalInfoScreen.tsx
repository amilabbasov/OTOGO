import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../../../navigations/types';
import { Routes } from '../../../../navigations/routes';
import useAuthStore from '../../../../stores/auth/authStore';
import { SvgImage } from '../../../../components/svgImage/SvgImage';
import { colors } from '../../../../theme/color';
import DateOfBirthInput from '../../../../components/registration/DateOfBirthInput';
import WorkHoursInput, { WorkHours } from '../../../../components/registration/WorkHoursInput';

function toIsoDate(date: string) {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
}

const SoleProviderPersonalInfoScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.personalInfo>["navigation"]>();
  const route = useRoute<MainScreenProps<Routes.personalInfo>["route"]>();
  const { completeProfile, isLoading, pendingProfileCompletion } = useAuthStore();

  const email = route.params?.email || pendingProfileCompletion?.email || '';
  const userType = route.params?.userType || pendingProfileCompletion?.userType || 'individual_provider';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [workHours, setWorkHours] = useState<WorkHours>({
    M: { open: '', close: '', enabled: true },
    T: { open: '', close: '', enabled: true },
    W: { open: '', close: '', enabled: true },
    T2: { open: '', close: '', enabled: true },
    F: { open: '', close: '', enabled: true },
    S: { open: '', close: '', enabled: true },
    S2: { open: '', close: '', enabled: false },
  });

  const handleUpload = () => {
    Alert.alert('Upload', 'Profile picture upload not implemented.');
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert(t('Error'), t('Please enter your first name'));
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t('Error'), t('Please enter your last name'));
      return false;
    }
    if (!email.trim()) {
      Alert.alert(t('Error'), t('Please enter your email'));
      return false;
    }
    if (!dateOfBirth.trim()) {
      Alert.alert(t('Error'), t('Please enter your date of birth'));
      return false;
    }
    if (!address.trim()) {
      Alert.alert(t('Error'), t('Please enter your address'));
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    const isoDate = toIsoDate(dateOfBirth);
    const result = await completeProfile(email, firstName.trim(), lastName.trim(), '', userType, isoDate, undefined, undefined);
    if (result.success) {
      navigation.navigate(Routes.carSelection, { userType });
    } else {
      Alert.alert(t('Error'), result.message || t('Failed to complete profile'));
    }
  };

  const isFormValid = firstName && lastName && email && dateOfBirth && address;

  const BUTTON_HEIGHT = 56;
  const BUTTON_BOTTOM_MARGIN = 10;
  const BUTTON_TOP_MARGIN = 15;
  const SAFE_AREA_BOTTOM_INSET = Platform.OS === 'ios' ? 20 : 0;
  const totalButtonSpace = BUTTON_HEIGHT + BUTTON_BOTTOM_MARGIN + SAFE_AREA_BOTTOM_INSET;


  return (
  <SafeAreaView style={styles.safeArea}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <View style={styles.mainWrapper}>
            <ScrollView
              contentContainerStyle={{
                paddingBottom: totalButtonSpace + BUTTON_TOP_MARGIN,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Your{"\n"}Information</Text>
                <Text style={styles.subtitle}>Please fill in your identity correctly</Text>
              </View>

              <View style={styles.profilePicSection}>
                <TouchableOpacity style={styles.profilePicBox} onPress={handleUpload} activeOpacity={0.7}>
                  {profilePic ? (
                    <Image source={{ uri: profilePic }} style={styles.profilePicImg} />
                  ) : (
                    <>
                      <SvgImage source={require('../../../../assets/svg/personalInfo/imagePlaceholder.svg')} width={32} height={32} />
                      <Text style={styles.profilePicText}>Upload your profile picture</Text>
                      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
                        <Text style={styles.uploadBtnText}>Upload</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                <View style={styles.row}>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.label}>First name*</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Martin"
                      placeholderTextColor="#C6C6C6"
                      autoCapitalize="words"
                      autoComplete="given-name"
                    />
                  </View>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.label}>Last name*</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Sances"
                      placeholderTextColor="#C6C6C6"
                      autoCapitalize="words"
                      autoComplete="family-name"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail*</Text>
                  <View style={styles.inputContainer}>
                    <SvgImage
                      source={require('../../../../assets/svg/personalInfo/email.svg')}
                      width={20}
                      height={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.inputWithIcon, { color: '#B3B3B3', backgroundColor: '#FAFAFA' }]}
                      value={email}
                      placeholder="Enter your email"
                      placeholderTextColor="#C6C6C6"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date of birth*</Text>
                  <DateOfBirthInput
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="DD/MM/YYYY"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    style={styles.addressInputEnhanced}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter your address"
                    placeholderTextColor="#C6C6C6"
                    multiline
                    numberOfLines={3}
                  />
                  <TouchableOpacity style={styles.chooseFromMapsBtn}>
                    <Text style={styles.chooseFromMapsText}>Choose from Maps</Text>
                    <SvgImage source={require('../../../../assets/svg/personalInfo/gps.svg')} width={21} height={20} />
                  </TouchableOpacity>
                </View>
                <WorkHoursInput value={workHours} onChange={setWorkHours} />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
        <View style={styles.fixedButtonArea}>
          <TouchableOpacity
            style={[styles.continueButton, (!isFormValid || isLoading) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!isFormValid || isLoading}
          >
            <Text style={[styles.continueButtonText, (!isFormValid || isLoading) && { color: '#fff' }]}>Continue</Text>
            <Text style={[styles.continueButtonArrow, (!isFormValid || isLoading) && { color: '#fff' }]}>→</Text>
          </TouchableOpacity>
        </View>
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
  mainWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    marginBottom: 0,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: 10,
    marginBottom: 10,
    fontWeight: '400',
    lineHeight: 22,
  },
  profilePicSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePicBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D5FF5F',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FAFAFA',
  },
  profilePicImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  profilePicText: {
    color: '#888',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadBtn: {
    backgroundColor: '#D5FF5F',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 4,
  },
  uploadBtnText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
  form: {
    gap: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroupHalf: {
    flex: 1,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: '#14151A',
    marginBottom: 2,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DFDFDF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FAFAFA',
    flex: 1,
    minHeight: 50,
  },
  inputWithIcon: {
    paddingLeft: 50,
    paddingRight: 20,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  addressInputEnhanced: {
    borderWidth: 1.5,
    borderColor: '#EFFF7B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  chooseFromMapsBtn: {
    borderWidth: 1,
    borderColor: '#B3B3B3',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  chooseFromMapsText: {
    color: '#14151A',
    fontSize: 16,
    fontWeight: '500',
  },
  fixedButtonArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 10 + (Platform.OS === 'ios' ? 20 : 0),
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: '#14151A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  continueButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#B3B3B3',
  },
  continueButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SoleProviderPersonalInfoScreen;