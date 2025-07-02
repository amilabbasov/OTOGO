import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SvgImage } from '../svgImage/SvgImage';
// Import NativeMethods for the measureInWindow method type
import type { NativeMethods } from 'react-native';

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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const buttonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setIsDropdownVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const measureButton = () => {
    // FIX 2-5: Add types for the measureInWindow callback parameters
    buttonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      const top = y + height + 5;
      const left = x;
      const calculatedWidth = width;

      const rightEdge = left + calculatedWidth;
      if (rightEdge > screenWidth - 10) {
          setDropdownPosition({
              top,
              left: screenWidth - calculatedWidth - 10,
              width: calculatedWidth,
          });
      } else {
          setDropdownPosition({ top, left, width: calculatedWidth });
      }
    });
  };

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        item.code === currentLanguage.code && styles.selectedLanguageItem
      ]}
      onPress={() => handleLanguageChange(item.code)}
    >
      <Text style={[
        styles.languageText,
        item.code === currentLanguage.code && styles.selectedLanguageText
      ]}>
        {item.nativeName}
      </Text>
      {item.code === currentLanguage.code && (
        <SvgImage
          source={require('../../assets/svg/auth/chevron-down.svg')}
          width={16}
          height={16}
          color="#D5FF5F"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={styles.languageButton}
        onPress={() => {
          measureButton();
          setIsDropdownVisible(true);
        }}
      >
        <Text style={styles.languageButtonText}>{currentLanguage.nativeName}</Text>
        <SvgImage
          source={require('../../assets/svg/auth/chevron-down.svg')}
          width={16}
          height={16}
          color="#666"
        />
      </TouchableOpacity>

      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View
            style={[
              styles.dropdown,
              {
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              },
            ]}
          >
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.4 }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 22,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  languageButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedLanguageItem: {
    backgroundColor: '#F0FDF4',
  },
  languageText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
  },
  selectedLanguageText: {
    color: '#059669',
    fontWeight: '500',
  },
});