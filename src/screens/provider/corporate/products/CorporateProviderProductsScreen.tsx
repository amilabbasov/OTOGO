import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../../../navigations/types';
import { Routes } from '../../../../navigations/routes';
import { colors } from '../../../../theme/color';
import useServicesStore from '../../../../stores/services/servicesStore';
import useProviderServicesStore from '../../../../stores/provider/providerServicesStore';

const CorporateProviderProductsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.products>['navigation']>();
  const route = useRoute<MainScreenProps<Routes.products>['route']>();
  const { services, isLoading, error, fetchServices } = useServicesStore();
  const { updateServices, isLoading: isUpdating } = useProviderServicesStore();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleTagSelection = (tagId: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedTags.length === 0) {
      Alert.alert(t('Error'), t('Please select at least one service'));
      return;
    }

    try {
      // Update services via API
      await updateServices(selectedTags, 'company_provider');
      
      // Navigate to branches screen
      navigation.navigate(Routes.branches, { userType: 'company_provider' });
    } catch (error) {
      console.error('Error updating services:', error);
      Alert.alert(t('Error'), t('Failed to update services. Please try again.'));
    }
  };

  const renderServiceTag = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.serviceTagCard,
        selectedTags.includes(item.id) && styles.selectedCard
      ]}
      onPress={() => handleTagSelection(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.serviceTagIcon}>
        <Text style={styles.serviceTagEmoji}>🏢</Text>
      </View>
      <View style={styles.serviceTagInfo}>
        <Text style={styles.serviceTagName}>{item.serviceName}</Text>
        <Text style={styles.serviceTagDescription}>{item.description || 'Professional service'}</Text>
        <Text style={styles.serviceTagCategory}>{item.category || 'General'}</Text>
      </View>
      <View style={styles.selectionIndicator}>
        {selectedTags.includes(item.id) && (
          <View style={styles.selectedIndicator} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('Loading services...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Products Your</Text>
          <Text style={styles.title}>Company Retails</Text>
          <Text style={styles.subtitle}>
            Select the services your company offers to customers
          </Text>
        </View>

        <FlatList
          data={services}
          renderItem={renderServiceTag}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (selectedTags.length === 0 || isUpdating) && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={selectedTags.length === 0 || isUpdating}
          >
            <Text style={styles.continueButtonText}>
              {isUpdating ? t('Saving...') : t('Continue')}
            </Text>
            <Text style={styles.continueButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000',
    marginBottom: 0,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    color: '#14151A',
    marginTop: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  listContainer: {
    paddingBottom: 20,
  },
  serviceTagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: '#F5FFF5',
  },
  serviceTagIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#E8F5E8',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceTagEmoji: {
    fontSize: 24,
  },
  serviceTagInfo: {
    flex: 1,
  },
  serviceTagName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  serviceTagDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  serviceTagCategory: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#B3B3B3',
  },
  continueButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  continueButtonArrow: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CorporateProviderProductsScreen; 