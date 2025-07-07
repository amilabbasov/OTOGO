import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView } from 'react-native';

const MOCK_SERVICES = [
  'Engine Services',
  'Car washing',
  'Evacuator',
  'Painting',
  'Yagdeyisme',
  'Razval',
  'Remendeyisme',
  'Radiator servisləri',
  'Motor servisi',
  'Self washing',
];

const ServiceSelection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(['Engine Services', 'Car washing', 'Evacuator']);

  const filteredServices = MOCK_SERVICES.filter(service =>
    service.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (name: string) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Services</Text>
        <Text style={styles.subHeader}>you provide</Text>
        <Text style={styles.desc}>Please select proper service types you provide, you can change later</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#B3B3B3"
          />
        </View>
        <View style={styles.chipContainer}>
          {filteredServices.map(service => (
            <TouchableOpacity
              key={service}
              style={selected.includes(service) ? styles.chipSelected : styles.chip}
              onPress={() => handleToggle(service)}
              activeOpacity={0.7}
            >
              <Text style={selected.includes(service) ? styles.chipTextSelected : styles.chipText}>
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreText}>More &gt;&gt;</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueBtn, selected.length === 0 && { opacity: 0.5 }]}
          disabled={selected.length === 0}
        >
          <Text style={styles.continueText}>Continue</Text>
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
});

export default ServiceSelection; 