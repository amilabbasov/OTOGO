import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { SvgImage } from '../svgImage/SvgImage';

const DAYS = [
  { key: 'M', label: 'Monday' },
  { key: 'T', label: 'Tuesday' },
  { key: 'W', label: 'Wednesday' },
  { key: 'T2', label: 'Thursday' },
  { key: 'F', label: 'Friday' },
  { key: 'S', label: 'Saturday' },
  { key: 'S2', label: 'Sunday' },
];

const DAY_KEYS = ['M', 'T', 'W', 'T2', 'F', 'S', 'S2'];

const getDayShort = (idx: number) => {
  if (idx === 3) return 'T';
  if (idx === 6) return 'S';
  return DAYS[idx].key;
};

export type WorkHours = {
  [key: string]: {
    open: string;
    close: string;
    enabled: boolean;
  };
};

interface WorkHoursInputProps {
  value: WorkHours;
  onChange: (value: WorkHours) => void;
}

const timeOptions = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00',
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
];

type PickerState = {
  visible: boolean;
  dayKey: string;
  type: 'open' | 'close';
};

const WorkHoursInput: React.FC<WorkHoursInputProps> = ({ value, onChange }) => {
  const [picker, setPicker] = useState<PickerState>({ visible: false, dayKey: '', type: 'open' });

  const handleToggleDay = (key: string) => {
    const updated = { ...value, [key]: { ...value[key], enabled: !value[key].enabled } };
    onChange(updated);
  };

  const handleTimeChange = (key: string, type: 'open' | 'close', time: string) => {
    const updated = { ...value, [key]: { ...value[key], [type]: time } };
    onChange(updated);
  };

  const openPicker = (dayKey: string, type: 'open' | 'close') => {
    setPicker({ visible: true, dayKey, type });
  };

  const closePicker = () => {
    setPicker({ ...picker, visible: false });
  };

  const selectTime = (time: string) => {
    handleTimeChange(picker.dayKey, picker.type, time);
    closePicker();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Work time</Text>
      {DAY_KEYS.map((key, idx) => (
        <View key={key} style={styles.row}>
          <TouchableOpacity
            style={[styles.dayCircle, value[key].enabled ? styles.dayActive : styles.dayInactive]}
            onPress={() => handleToggleDay(key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayText, !value[key].enabled && styles.dayTextInactive]}>
              {getDayShort(idx)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeBox, !value[key].enabled && styles.timeBoxDisabled]}
            disabled={!value[key].enabled}
            onPress={() => value[key].enabled && openPicker(key, 'open')}
            activeOpacity={0.7}
          >
            <Text style={[styles.timeText, !value[key].enabled && styles.timeTextDisabled]}>
              {value[key].open || 'Opens'}
            </Text>
            <SvgImage source={require('../../assets/svg/personalInfo/chevron-down.svg')} width={17} height={16} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <Text style={styles.timeDivider}> </Text>
          <TouchableOpacity
            style={[styles.timeBox, !value[key].enabled && styles.timeBoxDisabled]}
            disabled={!value[key].enabled}
            onPress={() => value[key].enabled && openPicker(key, 'close')}
            activeOpacity={0.7}
          >
            <Text style={[styles.timeText, !value[key].enabled && styles.timeTextDisabled]}>
              {value[key].close || 'Closes'}
            </Text>
            <SvgImage source={require('../../assets/svg/personalInfo/chevron-down.svg')} width={17} height={16} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      ))}
      <Modal
        visible={picker.visible}
        transparent
        animationType="fade"
        onRequestClose={closePicker}
      >
        <TouchableWithoutFeedback onPress={closePicker}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <FlatList
                data={timeOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => selectTime(item)}>
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  dayActive: {
    backgroundColor: '#D5FF5F',
  },
  dayInactive: {
    backgroundColor: '#DFDFDF',
  },
  dayText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#222',
  },
  dayTextInactive: {
    color: '#14151A',
  },
  timeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeBoxDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E6E6E6',
  },
  timeText: {
    color: '#222',
    fontSize: 15,
  },
  timeTextDisabled: {
    color: '#B3B3B3',
  },
  timeDivider: {
    width: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 200,
    maxHeight: 350,
    borderWidth: 2,
    borderColor: '#EFFF7B',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modalItem: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#222',
  },
});

export default WorkHoursInput; 