import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SvgImage } from '../svgImage/SvgImage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'EN' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'AZ' },
  { code: 'ru', name: 'Russian', nativeName: 'RU' },
];

const { width: screenWidth } = Dimensions.get('window');

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
  const animatedHeight = useSharedValue(0);
  const chevronRotation = useSharedValue(0);
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const otherLanguages = languages.filter(lang => lang.code !== currentLanguage.code);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      toggleDropdown();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const toggleDropdown = () => {
    const newState = !isDropdownVisible;
    setIsDropdownVisible(newState);
    
    animatedHeight.value = withTiming(newState ? 1 : 0, { duration: 300 });
    chevronRotation.value = withTiming(newState ? 180 : 0, { duration: 300 });
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    const baseHeight = 44;
    const itemHeight = 36;
    const expandedHeight = baseHeight + (otherLanguages.length * itemHeight);
    
    return {
      height: interpolate(
        animatedHeight.value,
        [0, 1],
        [baseHeight, expandedHeight]
      ),
    };
  });

  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${chevronRotation.value}deg` }],
    };
  });

  const animatedLanguagesStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedHeight.value,
      transform: [{ translateY: interpolate(animatedHeight.value, [0, 1], [-10, 0]) }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.languageButtonText}>{currentLanguage.nativeName}</Text>
        <Animated.View style={animatedChevronStyle}>
          <SvgImage
            source={require('../../assets/svg/auth/chevron-down.svg')}
            width={16}
            height={16}
            color="#666"
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.languagesList, animatedLanguagesStyle]} pointerEvents={isDropdownVisible ? 'auto' : 'none'}>
        {otherLanguages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={styles.languageItem}
            onPress={() => handleLanguageChange(language.code)}
            activeOpacity={0.7}
          >
            <Text style={styles.languageText}>{language.nativeName}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#737373',
    overflow: 'hidden',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 11,
    height: 44,
    minWidth: 60,
  },
  languageButtonText: {
    fontSize: 18,
    color: '#737373',
    fontWeight: '300',
  },
  languagesList: {
    flex: 1,
  },
  languageItem: {
    paddingHorizontal: 13,
    height: 36,
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 18,
    color: '#737373',
    fontWeight: '300',
  },
  selectedLanguageText: {
    color: '#059669',
    fontWeight: '500',
  },
});