import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../stores/auth/authStore';
import useProviderServicesStore from '../../stores/provider/providerServicesStore';
import useServicesStore from '../../stores/services/servicesStore';
import authService from '../../services/functions/authService';
import { Routes } from '../../navigations/routes';
import type { MainScreenProps } from '../../navigations/types';

const ServiceSelection: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.serviceSelection>['navigation']>();
  const { setPendingProfileCompletionState, userType } = useAuthStore();
  const { updateTags, isLoading: isUpdatingTags } = useProviderServicesStore();
  const { serviceTags, fetchServiceTags, isLoadingTags } = useServicesStore();
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [userServiceIds, setUserServiceIds] = useState<number[]>([]);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // Fetch user info to get serviceIds
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoadingUserInfo(true);
        let response;
        
        if (userType === 'individual_provider') {
          response = await authService.getIndividualProviderInformation();
        } else if (userType === 'company_provider') {
          response = await authService.getCompanyProviderInformation();
        } else {
          // For drivers, we don't need service info
          setIsLoadingUserInfo(false);
          return;
        }
        
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
  }, [userType, t]);

  // Fetch tags for user's selected services
  useEffect(() => {
    if (userServiceIds.length > 0) {
      userServiceIds.forEach(serviceId => {
        fetchServiceTags(serviceId);
      });
    }
  }, [userServiceIds, fetchServiceTags]);

  // Flatten all tags from user's selected services only
  const allTags = React.useMemo(() => {
    const tagMap: { [id: number]: any } = {};
    userServiceIds.forEach(serviceId => {
      const tagsArr = serviceTags[serviceId] || [];
      tagsArr.forEach(tag => {
        tagMap[tag.id] = tag;
      });
    });
    return Object.values(tagMap);
  }, [serviceTags, userServiceIds]);

  const filteredTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleContinue = async () => {
    try {
      // For providers, update tags via API
      if (userType && (userType === 'individual_provider' || userType === 'company_provider')) {
        await updateTags(selectedTags, userType);
      }
      
      // Set the next step to products for providers
      if (userType === 'individual_provider' || userType === 'company_provider') {
        setPendingProfileCompletionState({ 
          isPending: true, 
          userType: userType, 
          email: useAuthStore.getState().user?.email || '', 
          step: 'products'
        });
      } else {
        // For drivers, clear pending state and go to main app
        setPendingProfileCompletionState({ 
          isPending: false, 
          userType: null, 
          email: null, 
          step: null 
        });
        
        // Navigate to the main app based on user type
        if (userType === 'driver') {
          navigation.replace(Routes.driverTabs);
        } else {
          navigation.replace(Routes.providerTabs);
        }
      }
    } catch (error) {
      console.error('Error updating tags:', error);
      Alert.alert('Error', 'Failed to update tags. Please try again.');
    }
  };

  const handleSkip = () => {
    // For providers, set next step to products even when skipping
    if (userType === 'individual_provider' || userType === 'company_provider') {
      setPendingProfileCompletionState({ 
        isPending: true, 
        userType: userType, 
        email: useAuthStore.getState().user?.email || '', 
        step: 'products'
      });
    } else {
      // For drivers, skip also clears pending state and navigates to main app
      setPendingProfileCompletionState({ 
        isPending: false, 
        userType: null, 
        email: null, 
        step: null 
      });
      
      // Skip also navigates to main app
      if (userType === 'driver') {
        navigation.replace(Routes.driverTabs);
      } else {
        navigation.replace(Routes.providerTabs);
      }
    }
  };

  if (isLoadingUserInfo || isLoadingTags) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D5FF5F" />
            <Text style={styles.loadingText}>
              {isLoadingUserInfo ? t('Loading user information...') : t('Loading tags...')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Tags</Text>
        <Text style={styles.subHeader}>you provide</Text>
        <Text style={styles.desc}>Please select proper tags for your services, you can change later</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tags"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#B3B3B3"
          />
        </View>
        <View style={styles.chipContainer}>
          {filteredTags.map(tag => (
            <TouchableOpacity
              key={tag.id}
              style={selectedTags.includes(tag.id) ? styles.chipSelected : styles.chip}
              onPress={() => handleToggle(tag.id)}
              activeOpacity={0.7}
            >
              <Text style={selectedTags.includes(tag.id) ? styles.chipTextSelected : styles.chipText}>
                {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {filteredTags.length === 0 && !isLoadingUserInfo && (
          <Text style={styles.noTagsText}>No tags available for your selected services</Text>
        )}
        
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreText}>More &gt;&gt;</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueBtn, (selectedTags.length === 0 || isUpdatingTags) && { opacity: 0.5 }]}
          disabled={selectedTags.length === 0 || isUpdatingTags}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            {isUpdatingTags ? 'Updating...' : 'Continue'}
          </Text>
          <Text style={styles.continueArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 120 },
  header: { fontSize: 36, fontWeight: '700', marginTop: 8 },
  subHeader: { fontSize: 36, fontWeight: '700', marginBottom: 12 },
  desc: { fontSize: 16, color: '#B3B3B3', marginBottom: 24 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: { fontSize: 20, marginRight: 8, color: '#B3B3B3' },
  searchInput: { flex: 1, fontSize: 16, color: '#222' },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#fff',
    borderColor: '#E6E6E6',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: '#D5FF5F',
    borderColor: '#D5FF5F',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 10,
  },
  chipText: { color: '#222', fontSize: 16 },
  chipTextSelected: { color: '#222', fontWeight: '700', fontSize: 16 },
  moreBtn: { alignSelf: 'flex-start', marginTop: 4, marginBottom: 16 },
  moreText: { color: '#888', fontSize: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  skipBtn: {
    borderColor: '#E6E6E6',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  skipText: { color: '#222', fontSize: 18 },
  continueBtn: {
    backgroundColor: '#222',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: { color: '#D5FF5F', fontSize: 18, fontWeight: '600' },
  continueArrow: { color: '#D5FF5F', fontSize: 22, marginLeft: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  noTagsText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ServiceSelection; 