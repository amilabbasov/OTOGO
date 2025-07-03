import React, { useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import PagerView from 'react-native-pager-view';
import OnboardingScreen from './OnboardingScreen';
import UserTypeSelection from './UserTypeSelectionScreen';
import ProviderTypeSelection from './ProviderTypeSelectionScreen';
import ServiceSelection from './ServiceSelectionScreen';

type Props = AuthScreenProps<Routes.onboardingPager>;

const OnboardingPagerScreen: React.FC<Props> = ({ navigation }) => {
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const [userType, setUserType] = useState<string>('');
  const [providerType, setProviderType] = useState<string>('');
  const [service, setService] = useState<string>('');

  const handleNext = () => {
    if (pagerRef.current) {
      pagerRef.current.setPage(1);
    }
  };

  const handleUserTypeSelection = (selectedUserType: string) => {
    setUserType(selectedUserType);
    if (selectedUserType === 'provider') {
      if (pagerRef.current) {
        pagerRef.current.setPage(2);
      }
    } else {
      navigation.navigate(Routes.register, { userType: selectedUserType });
    }
  };

  const handleProviderTypeSelection = (selectedProviderType: string) => {
    setProviderType(selectedProviderType);
    if (pagerRef.current) {
      pagerRef.current.setPage(3);
    }
  };

  const handleServiceSelection = (selectedService: string) => {
    setService(selectedService);
    navigation.navigate(Routes.register, { 
      userType: userType
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <PagerView
        style={styles.pager}
        initialPage={0}
        scrollEnabled={false}
        overdrag={false}
        keyboardDismissMode="none"
        pageMargin={0}
        ref={pagerRef}
        onPageSelected={e => setPage(e.nativeEvent.position)}
      >
        <View key="onboarding">
          <OnboardingScreen onNext={handleNext} />
        </View>
        <View key="userType">
          <UserTypeSelection onNext={handleUserTypeSelection} />
        </View>
        <View key="providerType">
          <ProviderTypeSelection onNext={handleProviderTypeSelection} />
        </View>
        <View key="service">
          <ServiceSelection onNext={handleServiceSelection} />
        </View>
      </PagerView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  pager: {
    flex: 1,
  },
});

export default OnboardingPagerScreen;