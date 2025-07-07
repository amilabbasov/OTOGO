import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../../stores/auth/authStore';

const UserProfileScreen = () => {
  const { t } = useTranslation();
  
  const { logout, user, userType, fetchUserInformation } = useAuthStore(); 

  useEffect(() => {
    fetchUserInformation();
  }, [fetchUserInformation]);

  const handleLogout = () => {
    Alert.alert(
      t('Logout'),
      t('Are you sure you want to logout?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel',
        },
        {
          text: t('Logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert(t('Error'), t('Failed to logout. Please try again.'));
              console.error('Logout failed:', error);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    try {
      await fetchUserInformation(true);
    } catch (error) {
      Alert.alert(t('Error'), t('Failed to refresh profile. Please try again.'));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getUserTypeDisplay = (type?: string) => {
    switch (type) {
      case 'driver':
        return 'Driver';
      case 'individual_provider':
        return 'Individual Provider';
      case 'company_provider':
        return 'Company Provider';
      default:
        return type || 'Unknown';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.profileInfo}>
        <Text style={styles.title}>{t('Driver Profile')}</Text>
        
        {user ? (
          <View style={styles.userDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{user.name || 'Not provided'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Surname:</Text>
              <Text style={styles.value}>{user.surname || 'Not provided'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{user.phone || 'Not provided'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date of Birth:</Text>
              <Text style={styles.value}>{formatDate(user.birthday)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>User Type:</Text>
              <Text style={styles.value}>{getUserTypeDisplay(user.userType)}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.userInfo}>{t('User data not available.')}</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>{t('Refresh Profile')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>{t('Logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileInfo: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#015656',
    marginBottom: 30,
    textAlign: 'center',
  },
  userDetails: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#6c757d',
    flex: 2,
    textAlign: 'right',
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },

  refreshButton: {
    backgroundColor: '#015656',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    margin: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    margin: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfileScreen;