import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../stores/auth/authStore';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const CARD_ACTIVE_COLOR = '#22C55E';
const CARD_INACTIVE_COLOR = '#E5E7EB';

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

const UserTypeCard = ({ icon, title, description, selected, onPress }: any) => {
  const scale = useSharedValue(selected ? 1.05 : 1);
  const borderColor = useSharedValue(selected ? CARD_ACTIVE_COLOR : CARD_INACTIVE_COLOR);

  React.useEffect(() => {
    scale.value = withSpring(selected ? 1.05 : 1, { damping: 12 });
    borderColor.value = selected ? CARD_ACTIVE_COLOR : CARD_INACTIVE_COLOR;
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: borderColor.value,
    shadowOpacity: selected ? 0.18 : 0.08,
    shadowRadius: selected ? 16 : 8,
    elevation: selected ? 8 : 2,
  }));

  return (
    <Reanimated.View style={[styles.optionCard, animatedStyle]}>
      <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.8} onPress={onPress}>
        <Text style={styles.optionIcon}>{icon}</Text>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    </Reanimated.View>
  );
};

const UserTypeSelectionScreen = () => {
  const navigation = useNavigation();
  const { setUserType } = useAuthStore();
  const [selected, setSelected] = useState<'customer' | 'provider' | null>(null);

  // Animation values
  const providerScale = useSharedValue(1);
  const driverScale = useSharedValue(1);
  const providerRotateY = useSharedValue(0);
  const driverRotateY = useSharedValue(0);
  const providerRotateZ = useSharedValue(-8);
  const driverRotateZ = useSharedValue(8);
  const providerTranslateY = useSharedValue(0);
  const driverTranslateY = useSharedValue(0);
  const providerShadow = useSharedValue(8);
  const driverShadow = useSharedValue(8);

  // Press feedback
  const onPressIn = useCallback((type: 'provider' | 'customer') => {
    if (type === 'provider') providerScale.value = withSpring(0.97);
    else driverScale.value = withSpring(0.97);
  }, []);
  const onPressOut = useCallback((type: 'provider' | 'customer') => {
    if (type === 'provider') providerScale.value = withSpring(1);
    else driverScale.value = withSpring(1);
  }, []);

  const handleUserTypeSelection = async (userType: 'customer' | 'provider') => {
    setSelected(userType);
    if (userType === 'provider') {
      providerScale.value = withSpring(1.08);
      providerRotateY.value = withSpring(180);
      providerRotateZ.value = withSpring(0);
      providerTranslateY.value = withSpring(-16);
      providerShadow.value = withSpring(32);
      driverScale.value = withSpring(0.94);
      driverRotateY.value = withSpring(0);
      driverRotateZ.value = withSpring(12);
      driverTranslateY.value = withSpring(16);
      driverShadow.value = withSpring(4);
    } else {
      driverScale.value = withSpring(1.08);
      driverRotateY.value = withSpring(180);
      driverRotateZ.value = withSpring(0);
      driverTranslateY.value = withSpring(-16);
      driverShadow.value = withSpring(32);
      providerScale.value = withSpring(0.94);
      providerRotateY.value = withSpring(0);
      providerRotateZ.value = withSpring(-12);
      providerTranslateY.value = withSpring(16);
      providerShadow.value = withSpring(4);
    }
    setTimeout(async () => {
      await setUserType(userType);
      navigation.navigate('Auth' as never);
    }, 500);
  };

  const providerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: providerScale.value },
      { rotateY: `${providerRotateY.value}deg` },
      { rotateZ: `${providerRotateZ.value}deg` },
      { translateY: providerTranslateY.value },
    ],
    shadowRadius: providerShadow.value,
    zIndex: selected === 'provider' ? 2 : 1,
  }));

  const driverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: driverScale.value },
      { rotateY: `${driverRotateY.value}deg` },
      { rotateZ: `${driverRotateZ.value}deg` },
      { translateY: driverTranslateY.value },
    ],
    shadowRadius: driverShadow.value,
    zIndex: selected === 'customer' ? 2 : 1,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigationDots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Role</Text>
        <View style={styles.centeredCardsContainer}>
          <AnimatedTouchable
            style={[
              styles.animatedCard,
              selected === 'provider' ? styles.selectedCard : styles.unselectedCard,
              providerAnimatedStyle,
            ]}
            activeOpacity={0.85}
            onPressIn={() => onPressIn('provider')}
            onPressOut={() => onPressOut('provider')}
            onPress={() => handleUserTypeSelection('provider')}
          >
            <Text style={selected === 'provider' ? styles.selectedText : styles.unselectedText}>Provider</Text>
          </AnimatedTouchable>
          <AnimatedTouchable
            style={[
              styles.animatedCard,
              selected === 'customer' ? styles.selectedCard : styles.unselectedCard,
              driverAnimatedStyle,
            ]}
            activeOpacity={0.85}
            onPressIn={() => onPressIn('customer')}
            onPressOut={() => onPressOut('customer')}
            onPress={() => handleUserTypeSelection('customer')}
          >
            <Text style={selected === 'customer' ? styles.selectedText : styles.unselectedText}>Driver</Text>
          </AnimatedTouchable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
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
    backgroundColor: CARD_ACTIVE_COLOR,
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#111',
  },
  centeredCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: -60,
  },
  animatedCard: {
    width: 180,
    height: 220,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: CARD_INACTIVE_COLOR,
  },
  animatedCardSelected: {
    borderColor: CARD_ACTIVE_COLOR,
    shadowOpacity: 0.18,
    elevation: 16,
  },
  providerCard: {},
  driverCard: {},
  selectedCard: {
    backgroundColor: CARD_ACTIVE_COLOR,
    borderColor: CARD_ACTIVE_COLOR,
  },
  unselectedCard: {
    backgroundColor: '#fff',
    borderColor: CARD_ACTIVE_COLOR,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  unselectedText: {
    color: CARD_ACTIVE_COLOR,
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  cardText: {
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CARD_INACTIVE_COLOR,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: CARD_ACTIVE_COLOR,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 22,
    color: CARD_ACTIVE_COLOR,
    fontWeight: 'bold',
  },
});

export default UserTypeSelectionScreen; 