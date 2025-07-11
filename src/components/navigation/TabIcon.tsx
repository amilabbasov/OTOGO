import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgImage } from '../svgImage/SvgImage';

const ICONS = {
  home: {
    default: require('../../assets/svg/tabs/home.svg'),
    selected: require('../../assets/svg/tabs/home-selected.svg'),
  },
  search: {
    default: require('../../assets/svg/tabs/search.svg'),
    selected: require('../../assets/svg/tabs/search-selected.svg'),
  },
  profile: {
    default: require('../../assets/svg/tabs/profile.svg'),
    selected: require('../../assets/svg/tabs/profile-selected.svg'),
  },
};

const LABELS: Record<string, string> = {
  home: 'Home',
  search: 'Search',
  profile: 'Profile',
};

interface TabIconProps {
  route: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ route, focused }) => {
  const key = route.toLowerCase();
  const iconSet = ICONS[key as keyof typeof ICONS];
  const label = LABELS[key];
  if (!iconSet || !label) return null;
  const iconSource = focused && iconSet.selected ? iconSet.selected : iconSet.default;
  return (
    <View style={styles.container}>
      <SvgImage source={iconSource} width={24} height={24} />
      <Text
        style={[
          styles.label,
          { color: focused ? '#D5FF5F' : '#fff' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    flex: 1,
    height: '100%',
    marginTop: 35,
  },
  label: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default TabIcon; 