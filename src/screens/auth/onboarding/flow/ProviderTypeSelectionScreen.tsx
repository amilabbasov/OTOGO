import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SvgImage } from '../../../../components/svgImage/SvgImage';
import { useTranslation } from 'react-i18next';

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

const providerTypes = [
  { id: 'corporate', label: 'Corporate provider' },
  { id: 'sole', label: 'Sole provider' },

];

const CARD_WIDTH = 160;
const CARD_HEIGHT = 200;

interface ProviderTypeSelectionProps {
  onNext: (providerType: string) => void;
}

const ProviderTypeSelection: React.FC<ProviderTypeSelectionProps> = ({ onNext }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const { t } = useTranslation();

  const getSharedStyles = (typeId: string, isSelected: boolean) => {
    const scale = useSharedValue(isSelected ? 1.1 : 1);
    const translateY = useSharedValue(isSelected ? -20 : 0);
    const rotate = useSharedValue(typeId === 'corporate' ? -15 : 15);
    const zIndex = isSelected ? 2 : 1;
    const elevation = isSelected ? 12 : 4;

    React.useEffect(() => {
      scale.value = withSpring(isSelected ? 1.1 : 1);
      translateY.value = withSpring(isSelected ? -20 : 0);
      rotate.value = withSpring(isSelected ? 0 : (typeId === 'corporate' ? -15 : 15));
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

  const handleContinue = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredGroup}>
        <Text style={styles.title}>{t('Which describes you the best?')}</Text>
        <View style={styles.cardContainer}>
          {providerTypes.map(type => {
            const isSelected = selected === type.id;
            const animatedStyle = getSharedStyles(type.id, isSelected);

            return (
              <AnimatedTouchable
                key={type.id}
                style={[styles.card, isSelected ? styles.selectedCard : {}, animatedStyle]}
                onPress={() => setSelected(type.id)}
                activeOpacity={1}
              >
                <Text style={isSelected ? styles.selectedText : styles.text}>{t(type.label)}</Text>
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
        <Text style={styles.buttonText}>{t('Next')}</Text>
        <SvgImage source={require('../../../../assets/svg/onboarding/circle-arrow-right.svg')} width={20} height={20} style={styles.buttonArrow} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProviderTypeSelection;

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
    paddingHorizontal: 24,
    lineHeight: 48,
    fontWeight: '700',
    marginBottom: 100,
  },
  cardContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    padding: 25,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#D5FF5F',
    textAlign: 'center',
  },
  selectedText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
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
