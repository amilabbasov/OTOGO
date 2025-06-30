import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import type { OnboardingScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import i18n from '../../../locales/i18n';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { useTranslation } from 'react-i18next';

type Props = OnboardingScreenProps<Routes.changeLanguage>;

const languages = [
  { code: 'az', label: 'Azərbaycan dili' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

const ChangeLanguageScreen: React.FC<Props> = ({ navigation }) => {
  const [selected, setSelected] = React.useState(i18n.language);
  const { t } = useTranslation();
  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setSelected(code);
  };

  const handleContinue = () => {
    if (selected) {
      navigation.replace(Routes.onboardingPager);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{t('Select Language')}</Text>
        <View style={styles.list}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.button, selected === lang.code && styles.selectedButton]}
              onPress={() => handleSelect(lang.code)}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, selected === lang.code && styles.selectedButtonText]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.continueButton, !selected && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!selected}
        activeOpacity={0.8}
      >
        <Text style={[styles.continueButtonText, !selected && styles.disabledButtonText]}>
          {t('Save and Continue')}
        </Text>
        <SvgImage 
          source={require('../../../assets/svg/onboarding/circle-arrow-right.svg')} 
          width={20} 
          height={20} 
          style={styles.buttonArrow} 
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
  },
  list: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  button: {
    width: 260,
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#22C55E',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#22C55E',
  },
  buttonText: {
    fontSize: 18,
    color: '#22C55E',
    fontWeight: '600',
  },
  selectedButtonText: {
    color: '#fff',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 15,
    width: '90%',
    marginTop: 'auto',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButtonText: {
    color: '#999',
  },
  buttonArrow: {
    marginLeft: 8,
  },
});

export default ChangeLanguageScreen; 