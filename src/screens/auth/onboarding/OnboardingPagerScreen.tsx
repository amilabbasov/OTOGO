import React, { useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import type { AuthScreenProps } from '../../../navigations/types';
import { Routes } from '../../../navigations/routes';
import PagerView from 'react-native-pager-view';
import OnboardingScreen from './OnboardingScreen';
import UserTypeSelection from './UserTypeSelectionScreen'; 

type Props = AuthScreenProps<Routes.onboardingPager>;

const OnboardingPagerScreen: React.FC<Props> = ({ navigation }) => {
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);

  const handleNext = () => {
    if (pagerRef.current) {
      pagerRef.current.setPage(1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigationDots}>
        <View style={[styles.dot, page === 0 && styles.activeDot]} />
        <View style={[styles.dot, page === 1 && styles.activeDot]} />
      </View>
      <PagerView
        style={styles.pager}
        initialPage={0}
        scrollEnabled={false}
        ref={pagerRef}
        onPageSelected={e => setPage(e.nativeEvent.position)}
      >
        <View key="onboarding">
          <OnboardingScreen onNext={handleNext} />
        </View>
        <View key="userType">
          <UserTypeSelection />
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
  navigationDots: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
    opacity: 0.6,
  },
  activeDot: {
    backgroundColor: '#111',
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
});

export default OnboardingPagerScreen;