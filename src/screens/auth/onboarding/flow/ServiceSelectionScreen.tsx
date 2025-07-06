import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { SvgImage } from '../../../../components/svgImage/SvgImage';
import { useTranslation } from 'react-i18next';
import useServicesStore from '../../../../stores/services/servicesStore';
import useProviderServicesStore from '../../../../stores/provider/providerServicesStore';

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);

const CARD_WIDTH = 140;
const CARD_HEIGHT = 160;

interface ServiceSelectionProps {
  onNext: (services: string[]) => void;
  userType?: 'individual_provider' | 'company_provider';
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ onNext, userType }) => {
  const [selected, setSelected] = useState<number[]>([]);
  const { t } = useTranslation();
  const { services, isLoading, error, fetchServices } = useServicesStore();
  const { updateServices, isLoading: isUpdating, error: updateError } = useProviderServicesStore();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleServiceToggle = (serviceId: number) => {
    setSelected(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      return;
    }

    try {
      // If this is a provider (not during registration), update services via API
      if (userType && (userType === 'individual_provider' || userType === 'company_provider')) {
        await updateServices(selected, userType);
      }
      
      // Convert service IDs to service names for backward compatibility
      const selectedServiceNames = services
        .filter(service => selected.includes(service.id))
        .map(service => service.serviceName);
      
      onNext(selectedServiceNames);
    } catch (error) {
      console.error('Error updating services:', error);
      // Still proceed with the flow even if API call fails
      const selectedServiceNames = services
        .filter(service => selected.includes(service.id))
        .map(service => service.serviceName);
      
      onNext(selectedServiceNames);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredGroup}>
          <ActivityIndicator size="large" color="#D5FF5F" />
          <Text style={styles.loadingText}>{t('Loading services...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredGroup}>
          <Text style={styles.errorText}>{t('Failed to load services')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
            <Text style={styles.retryButtonText}>{t('Retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centeredGroup}>
        <Text style={styles.title}>{t('What services do you offer?')}</Text>
        <View style={styles.cardGrid}>
          {services.map(service => {
            const isSelected = selected.includes(service.id);
            
            return (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={isSelected}
                onPress={() => handleServiceToggle(service.id)}
              />
            );
          })}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.button, selected.length === 0 && { opacity: 0.5 }]}
        disabled={selected.length === 0 || isUpdating}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>
          {isUpdating ? t('Updating...') : t('Get Started')}
        </Text>
        <SvgImage source={require('../../../../assets/svg/onboarding/circle-arrow-right.svg')} width={20} height={20} style={styles.buttonArrow} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Separate component for animated service cards
const ServiceCard: React.FC<{
  service: { id: number; serviceName: string };
  isSelected: boolean;
  onPress: () => void;
}> = ({ service, isSelected, onPress }) => {
  const scale = useSharedValue(isSelected ? 1.05 : 1);
  const translateY = useSharedValue(isSelected ? -10 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.05 : 1);
    translateY.value = withSpring(isSelected ? -10 : 0);
  }, [isSelected, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    zIndex: isSelected ? 2 : 1,
    elevation: isSelected ? 12 : 4,
  }));

  return (
    <AnimatedTouchable
      style={[styles.card, isSelected ? styles.selectedCard : {}, animatedStyle]}
      onPress={onPress}
      activeOpacity={1}
    >
      <Text style={isSelected ? styles.selectedText : styles.text}>
        {service.serviceName}
      </Text>
    </AnimatedTouchable>
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#D5FF5F',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
