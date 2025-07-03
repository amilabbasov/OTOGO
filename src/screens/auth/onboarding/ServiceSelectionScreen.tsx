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

const services = [
  { id: 'automotive-service', label: 'Automotive Service' },
  { id: 'automotive-store', label: 'Automotive Store' },
  { id: 'evacuator', label: 'Evacuator' },
  { id: 'sober-driver', label: 'Sober Driver' },
];

const CARD_WIDTH = 140;
const CARD_HEIGHT = 160;

interface ServiceSelectionProps {
  onNext: (service: string) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ onNext }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const { t } = useTranslation();

  const getSharedStyles = (serviceId: string, isSelected: boolean) => {
    const scale = useSharedValue(isSelected ? 1.05 : 1);
    const translateY = useSharedValue(isSelected ? -10 : 0);
    const zIndex = isSelected ? 2 : 1;
    const elevation = isSelected ? 12 : 4;

    React.useEffect(() => {
      scale.value = withSpring(isSelected ? 1.05 : 1);
      translateY.value = withSpring(isSelected ? -10 : 0);
    }, [isSelected]);

    const style = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      zIndex,
      elevation,
    }));

    return style;
  };

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredGroup}>
        <Text style={styles.title}>{t('What services do you offer?')}</Text>
        <View style={styles.cardGrid}>
          {services.map(service => {
            const isSelected = selected === service.id;
            const animatedStyle = getSharedStyles(service.id, isSelected);

            return (
              <AnimatedTouchable
                key={service.id}
                style={[styles.card, isSelected ? styles.selectedCard : {}, animatedStyle]}
                onPress={() => setSelected(service.id)}
                activeOpacity={1}
              >
                <Text style={isSelected ? styles.selectedText : styles.text}>{t(service.label)}</Text>
              </AnimatedTouchable>
            );
          })}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.button, !selected && { opacity: 0.5 }]}
        disabled={!selected}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>{t('Get Started')}</Text>
        <SvgImage source={require('../../../assets/svg/onboarding/circle-arrow-right.svg')} width={20} height={20} style={styles.buttonArrow} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ServiceSelection;

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
    textAlign: 'center',
    lineHeight: 48,
    fontWeight: '700',
    marginBottom: 80,
    paddingHorizontal: 24,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#49454F',
    borderWidth: 2,
    borderColor: '#49454F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  selectedCard: {
    backgroundColor: '#D5FF5F',
    borderColor: '#D5FF5F',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D5FF5F',
    textAlign: 'center',
    lineHeight: 22,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 15,
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 20,
    alignSelf: 'stretch',
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
