import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { MainScreenProps } from '../../../../navigations/types';
import { Routes } from '../../../../navigations/routes';
import { colors } from '../../../../theme/color';
import useAuthStore from '../../../../stores/auth/authStore';

interface WorkingHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00', '00:00'
];

const CorporateProviderBranchesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MainScreenProps<Routes.branches>['navigation']>();
  const route = useRoute<MainScreenProps<Routes.branches>['route']>();
  const { setPendingProfileCompletionState } = useAuthStore();
  const [workingHours, setWorkingHours] = useState<{ [key: string]: WorkingHours }>(() => {
    const initial: { [key: string]: WorkingHours } = {};
    daysOfWeek.forEach(day => {
      initial[day.key] = {
        day: day.key,
        isOpen: day.key !== 'sunday', // Default closed on Sunday
        openTime: '09:00',
        closeTime: '18:00',
      };
    });
    return initial;
  });

  const handleDayToggle = (dayKey: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey].isOpen,
      }
    }));
  };

  const handleTimeChange = (dayKey: string, timeType: 'openTime' | 'closeTime', time: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [timeType]: time,
      }
    }));
  };

  const handleContinue = () => {
    // Validate that at least one day is open
    const hasOpenDays = Object.values(workingHours).some(day => day.isOpen);
    
    if (!hasOpenDays) {
      Alert.alert(t('Error'), t('Please set working hours for at least one day'));
      return;
    }

    // Complete the corporate provider registration flow
    Alert.alert(
      t('Success'),
      t('Registration completed successfully! Welcome to OTOGO.'),
      [
        {
          text: t('OK'),
          onPress: () => {
            // Mark profile completion as done - this will trigger MainRouter to show the main app
            setPendingProfileCompletionState({ isPending: false, userType: null, email: null });
          }
        }
      ]
    );
  };

  const renderDayRow = (day: { key: string; label: string }) => {
    const dayHours = workingHours[day.key];
    
    return (
      <View key={day.key} style={styles.dayRow}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayLabel}>{day.label}</Text>
          <TouchableOpacity
            style={[styles.toggleSwitch, dayHours.isOpen && styles.toggleSwitchActive]}
            onPress={() => handleDayToggle(day.key)}
          >
            <View style={[styles.toggleKnob, dayHours.isOpen && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>
        
        {dayHours.isOpen && (
          <View style={styles.timeContainer}>
            <View style={styles.timePicker}>
              <Text style={styles.timeLabel}>{t('Open')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                {timeSlots.map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      dayHours.openTime === time && styles.selectedTimeSlot
                    ]}
                    onPress={() => handleTimeChange(day.key, 'openTime', time)}
                  >
                    <Text style={[
                      styles.timeText,
                      dayHours.openTime === time && styles.selectedTimeText
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.timePicker}>
              <Text style={styles.timeLabel}>{t('Close')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                {timeSlots.map(time => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      dayHours.closeTime === time && styles.selectedTimeSlot
                    ]}
                    onPress={() => handleTimeChange(day.key, 'closeTime', time)}
                  >
                    <Text style={[
                      styles.timeText,
                      dayHours.closeTime === time && styles.selectedTimeText
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Company</Text>
          <Text style={styles.title}>Branches</Text>
          <Text style={styles.subtitle}>
            Set your company's daily working hours for each day of the week
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {daysOfWeek.map(renderDayRow)}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              Complete Registration
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
  header: {
    marginBottom: 30,
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
  content: {
    flex: 1,
  },
  dayRow: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    backgroundColor: '#fff',
    borderRadius: 13,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  timeContainer: {
    gap: 16,
  },
  timePicker: {
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  timeScroll: {
    flexDirection: 'row',
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#000',
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 20,
    paddingTop: 20,
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

export default CorporateProviderBranchesScreen; 