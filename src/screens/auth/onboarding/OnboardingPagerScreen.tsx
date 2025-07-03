import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Animated, Dimensions, TouchableOpacity } from 'react-native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import OnboardingScreen from '../onboarding/flow/OnboardingScreen';
import UserTypeSelection from './flow/UserTypeSelectionScreen';
import ProviderTypeSelection from './flow/ProviderTypeSelectionScreen';
import ServiceSelection from '../onboarding/flow/ServiceSelectionScreen';
import { SvgImage } from '../../../components/svgImage/SvgImage';

const { width: screenWidth } = Dimensions.get('window');

type Props = AuthScreenProps<Routes.onboardingPager>;

type ScreenType = 'onboarding' | 'userType' | 'providerType' | 'service';

const OnboardingPagerScreen: React.FC<Props> = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('onboarding');
  const [userType, setUserType] = useState<'driver' | 'provider' | null>(null);
  const [providerType, setProviderType] = useState<string>('');
  const [service, setService] = useState<string>('');

  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const animateToScreen = (newScreen: ScreenType, reverse = false) => {
    if (isAnimating) return;

    setIsAnimating(true);

    const slideDirection = reverse ? screenWidth : -screenWidth;
    const slideStart = reverse ? -screenWidth : screenWidth;

    Animated.timing(slideAnim, {
      toValue: slideDirection,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(newScreen);

      slideAnim.setValue(slideStart);

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };

  const handleNext = () => {
    animateToScreen('userType', false);
  };

  const handleBack = () => {
    switch (currentScreen) {
      case 'userType':
        animateToScreen('onboarding', true);
        break;
      case 'providerType':
        animateToScreen('userType', true);
        break;
      case 'service':
        animateToScreen('providerType', true);
        break;
      default:
        navigation.goBack();
        break;
    }
  };

  const handleUserTypeSelection = (userType: string) => {
    if (userType === 'driver' || userType === 'provider') {
      setUserType(userType);
      
      if (userType === 'driver') {
        navigation.navigate(Routes.register, {
          userType: userType
        });
      } else {
        animateToScreen('providerType', false);
      }
    } else {
      console.error('Invalid user type:', userType);
    }
  };

  const handleProviderTypeSelection = (selectedProviderType: string) => {
    setProviderType(selectedProviderType);
    animateToScreen('service', false);
  };

  const handleServiceSelection = (selectedService: string) => {
    setService(selectedService);
    navigation.navigate(Routes.register, {
      userType: userType
    });
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onNext={handleNext} />;
      case 'userType':
        return <UserTypeSelection onNext={handleUserTypeSelection} />;
      case 'providerType':
        return <ProviderTypeSelection onNext={handleProviderTypeSelection} />;
      case 'service':
        return <ServiceSelection onNext={handleServiceSelection} />;
      default:
        return <OnboardingScreen onNext={handleNext} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen !== 'onboarding' && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <SvgImage 
            source={require('../../../assets/svg/auth/goBack.svg')} 
            width={40} 
            height={40} 
            color="#111" 
          />
        </TouchableOpacity>
      )}
      
      <Animated.View
        style={[
          styles.screenContainer,
          {
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        {renderCurrentScreen()}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  screenContainer: {
    flex: 1,
    width: screenWidth,
  },
});

export default OnboardingPagerScreen;