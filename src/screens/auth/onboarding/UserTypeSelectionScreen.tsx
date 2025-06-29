import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../stores/auth/authStore';
import Reanimated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const CARD_ACTIVE_COLOR = '#015656';
const CARD_INACTIVE_COLOR = '#e5e7eb';

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

  const handleUserTypeSelection = async (userType: 'customer' | 'provider') => {
    setSelected(userType);
    setTimeout(async () => {
      await setUserType(userType);
      navigation.navigate('Auth' as never);
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navigationDots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Role</Text>
        <View style={styles.optionsContainer}>
          <UserTypeCard
            icon="👤"
            title="Customer"
            description="I want to book services and find providers"
            selected={selected === 'customer'}
            onPress={() => handleUserTypeSelection('customer')}
          />
          <UserTypeCard
            icon="🔧"
            title="Service Provider"
            description="I want to provide services and earn money"
            selected={selected === 'provider'}
            onPress={() => handleUserTypeSelection('provider')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#111',
  },
  optionsContainer: {
    gap: 20,
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