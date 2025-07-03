import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Animated, Dimensions } from 'react-native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import OnboardingScreen from './OnboardingScreen';
import UserTypeSelection from './UserTypeSelectionScreen';
import ProviderTypeSelection from './ProviderTypeSelectionScreen';
import ServiceSelection from './ServiceSelectionScreen';

const { width: screenWidth } = Dimensions.get('window');

type Props = AuthScreenProps<Routes.onboardingPager>;

type ScreenType = 'onboarding' | 'userType' | 'providerType' | 'service';

const OnboardingPagerScreen: React.FC<Props> = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('onboarding');
  const [userType, setUserType] = useState<string>('');
  const [providerType, setProviderType] = useState<string>('');
  const [service, setService] = useState<string>('');

  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const animateToScreen = (newScreen: ScreenType) => {
    if (isAnimating) return;

    setIsAnimating(true);

    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(newScreen);

      slideAnim.setValue(screenWidth);

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
    animateToScreen('userType');
  };

  const handleUserTypeSelection = (selectedUserType: string) => {
    setUserType(selectedUserType);
    if (selectedUserType === 'provider') {
      animateToScreen('providerType');
    } else {
      navigation.navigate(Routes.register, { userType: selectedUserType });
    }
  };

  const handleProviderTypeSelection = (selectedProviderType: string) => {
    setProviderType(selectedProviderType);
    animateToScreen('service');
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
  screenContainer: {
    flex: 1,
    width: screenWidth,
  },
});

export default OnboardingPagerScreen;