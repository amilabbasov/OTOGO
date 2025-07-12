import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../../theme/color';
import useServicesStore from '../../../../stores/services/servicesStore';
import useProviderServicesStore from '../../../../stores/provider/providerServicesStore';
import useAuthStore from '../../../../stores/auth/authStore';
import SuccessModal from '../../../../components/success/SuccessModal';
import { Tag } from '../../../../types/common';
import authService from '../../../../services/functions/authService';

const TAGS_PREVIEW_COUNT = 8;

const SoleProviderProductsScreen = () => {
  const { t } = useTranslation();
  const { services, isLoading, fetchServices, serviceTags, fetchServiceTags, isLoadingTags } = useServicesStore();
  const { updateTags, isLoading: isUpdating } = useProviderServicesStore();
  const { setPendingProfileCompletionState, user } = useAuthStore();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [userServiceIds, setUserServiceIds] = useState<number[]>([]);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // Fetch user info to get serviceIds
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoadingUserInfo(true);
        const response = await authService.getIndividualProviderInformation();
        const userInfo = response.data;
        setUserServiceIds(userInfo.serviceIds || []);
      } catch (error: any) {
        console.error('Failed to fetch user info:', error);
        Alert.alert(t('Error'), t('Failed to load user information. Please try again.'));
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Fetch tags for user's selected services
  useEffect(() => {
    if (userServiceIds.length > 0) {
      userServiceIds.forEach(serviceId => {
        fetchServiceTags(serviceId);
      });
    }
  }, [userServiceIds, fetchServiceTags]);

  // Flatten all tags from user's selected services only
  const allTags = useMemo(() => {
    const tagMap: { [id: number]: Tag } = {};
    userServiceIds.forEach(serviceId => {
      const tagsArr = serviceTags[serviceId] || [];
      tagsArr.forEach(tag => {
        tagMap[tag.id] = tag;
      });
    });
    const result = Object.values(tagMap);
    return result;
  }, [serviceTags, userServiceIds]);

  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!search.trim()) return allTags;
    return allTags.filter(tag => tag.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [allTags, search]);

  // Show preview or all tags
  const tagsToShow = showAll ? filteredTags : filteredTags.slice(0, TAGS_PREVIEW_COUNT);
  const hasMore = filteredTags.length > TAGS_PREVIEW_COUNT;

  const handleTagSelection = (tagId: number) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  const handleContinue = async () => {
    if (selectedTags.length === 0) {
      Alert.alert(t('Error'), t('Please select at least one tag'));
      return;
    }
    try {
      await updateTags(selectedTags, 'individual_provider');
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to update services. Please try again.'));
    }
  };

  const handleSkip = () => {
    setPendingProfileCompletionState({ isPending: false, userType: null, email: null, step: null });
  };

  if (isLoading || isLoadingUserInfo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('Loading...')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show message if no services are selected
  if (userServiceIds.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>No Services</Text>
            <Text style={styles.title}>Selected</Text>
            <Text style={styles.subtitle}>You need to select services first before you can choose tags. Please complete the onboarding process.</Text>
          </View>
          <View style={styles.centerContent}>
            <Text style={styles.noServicesText}>
              Please go back and complete the service selection during onboarding.
            </Text>
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => setPendingProfileCompletionState({ isPending: false, userType: null, email: null, step: null })}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Go to Main App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuccessModal
        visible={showSuccessModal}
        message={t('All ready set!')}
        onHide={() => {
          setShowSuccessModal(false);
          setPendingProfileCompletionState({ isPending: false, userType: null, email: null, step: null });
        }}
        svgSource={require('../../../../assets/svg/success/allSet-success.svg')}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Services</Text>
          <Text style={styles.title}>you provide</Text>
          <Text style={styles.subtitle}>Please select proper service types you provide, you can change later</Text>
        </View>
        <View style={styles.searchBoxWrapper}>
          <View style={styles.searchBoxIcon}><Text style={{fontSize:18}}>🔍</Text></View>
          <TextInput
            style={styles.searchBox}
            placeholder={t('Search services')}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#C6C6C6"
          />
        </View>
        <View style={styles.tagsWrapper}>
          {isLoadingTags ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <View style={styles.tagsRow}>
                {tagsToShow.map(tag => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.tagChip, selectedTags.includes(tag.id) && styles.selectedTagChip]}
                    onPress={() => handleTagSelection(tag.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag.id) && styles.selectedTagText]}>{tag.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {hasMore && (
                <TouchableOpacity onPress={() => setShowAll(v => !v)}>
                  <Text style={styles.moreText}>{showAll ? 'Less <<' : 'More >>'}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.continueButton, (selectedTags.length === 0 || isUpdating) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={selectedTags.length === 0 || isUpdating}
          >
            <Text style={styles.continueButtonText}>{isUpdating ? t('Saving...') : 'Continue'}</Text>
            <Text style={styles.continueButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  header: { marginBottom: 24, marginTop: 8 },
  title: { fontSize: 32, fontWeight: '700', color: '#111', lineHeight: 38 },
  subtitle: { fontSize: 15, color: '#888', marginTop: 12, fontWeight: '400', lineHeight: 22 },
  searchBoxWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 16, paddingHorizontal: 16, marginBottom: 18, height: 48, marginTop: 8 },
  searchBoxIcon: { marginRight: 8 },
  searchBox: { flex: 1, fontSize: 16, color: '#111', backgroundColor: 'transparent', borderWidth: 0 },
  tagsWrapper: { marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { backgroundColor: '#F6F6F6', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 8 },
  selectedTagChip: { backgroundColor: '#D4FF3F', borderColor: '#D4FF3F' },
  tagText: { fontSize: 15, color: '#222', fontWeight: '500' },
  selectedTagText: { color: '#111' },
  moreText: { color: '#888', fontSize: 15, marginTop: 2, marginLeft: 4, fontWeight: '500' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: 16, gap: 12 },
  skipButton: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginRight: 8 },
  skipButtonText: { color: '#222', fontSize: 16, fontWeight: '500' },
  continueButton: { flex: 2, backgroundColor: '#111', borderRadius: 16, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  continueButtonDisabled: { opacity: 0.5, backgroundColor: '#B3B3B3' },
  continueButtonText: { color: '#D4FF3F', fontSize: 16, fontWeight: '500' },
  continueButtonArrow: { color: '#D4FF3F', fontSize: 18, fontWeight: '600', marginLeft: 6 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  noServicesText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
});

export default SoleProviderProductsScreen; 