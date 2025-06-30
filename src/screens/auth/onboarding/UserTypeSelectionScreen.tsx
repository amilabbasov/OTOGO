import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SvgImage } from '../../../components/svgImage/SvgImage';
import { useTranslation } from 'react-i18next';

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

const roles = [
  { id: 'provider', label: 'Provider' },
  { id: 'driver', label: 'Driver' },
];

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;

const UserTypeSelection = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { t } = useTranslation();
  const getSharedStyles = (roleId: string, isSelected: boolean) => {
    const scale = useSharedValue(isSelected ? 1.1 : 1);
    const translateY = useSharedValue(isSelected ? -20 : 0);
    const rotate = useSharedValue(roleId === 'provider' ? -15 : 15);
    const zIndex = isSelected ? 2 : 1;
    const elevation = isSelected ? 12 : 4;

    React.useEffect(() => {
      scale.value = withSpring(isSelected ? 1.1 : 1);
      translateY.value = withSpring(isSelected ? -20 : 0);
      rotate.value = withSpring(isSelected ? 0 : (roleId === 'provider' ? -15 : 15));
    }, [isSelected]);

    const style = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` }
      ],
      zIndex,
      elevation,
    }));

    return style;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredGroup}>
        <Text style={styles.title}>{t('Choose Your Role')}</Text>
        <View style={styles.cardContainer}>
          {roles.map(role => {
            const isSelected = selected === role.id;
            const animatedStyle = getSharedStyles(role.id, isSelected);

            return (
              <AnimatedTouchable
                key={role.id}
                style={[styles.card, isSelected ? styles.selectedCard : {}, animatedStyle]}
                onPress={() => setSelected(role.id)}
                activeOpacity={1}
              >
                <Text style={isSelected ? styles.selectedText : styles.text}>{t(role.label)}</Text>
              </AnimatedTouchable>
            );
          })}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.button, !selected && { opacity: 0.5 }]}
        disabled={!selected}
        onPress={() => console.log('Selected role:', selected)}
      >
        <Text style={styles.buttonText}>{t('Get Started')}</Text>
        <SvgImage source={require('../../../assets/svg/onboarding/circle-arrow-right.svg')} width={20} height={20} style={styles.buttonArrow} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UserTypeSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 36,
    lineHeight: 48,
    fontWeight: '700',
    marginBottom: 100,
  },
  cardContainer: {
    flexDirection: 'row',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  selectedCard: {
    backgroundColor: '#22C55E',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#22C55E',
  },
  selectedText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 15,
    justifyContent: 'center',
    paddingHorizontal: '35%',
    marginTop: 'auto',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonArrow: {
    marginLeft: 8,
  },
});
