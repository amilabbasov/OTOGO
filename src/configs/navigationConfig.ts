import { colors } from '../theme/color';

export const defaultScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  cardStyle: { backgroundColor: colors.background },
};

export const modalScreenOptions = {
  ...defaultScreenOptions,
  presentation: 'modal' as const,
  animation: 'slide_from_bottom' as const,
};