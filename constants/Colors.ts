const tintColorLight = '#1a73e8';
const tintColorDark = '#8ab4f8';

type ThemeColors = {
  text: string;
  background: string;
  card: string;
  border: string;
  notification: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  primary: string;
  secondary: string;
  surface: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  divider: string;
  overlay: string;
  isDark: boolean;
};

type ThemePalette = {
  light: ThemeColors;
  dark: ThemeColors;
};

const lightColors: ThemeColors = {
  text: '#202124',
  background: '#ffffff',
  card: '#ffffff',
  border: '#dadce0',
  notification: '#f44336',
  tint: tintColorLight,
  tabIconDefault: '#9aa0a6',
  tabIconSelected: tintColorLight,
  primary: '#1a73e8',
  secondary: '#5f6368',
  surface: '#ffffff',
  error: '#d32f2f',
  success: '#388e3c',
  warning: '#f57c00',
  info: '#0288d1',
  divider: 'rgba(0, 0, 0, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  isDark: false,
};

const darkColors: ThemeColors = {
  text: '#e8eaed',
  background: '#121212',
  card: '#1e1e1e',
  border: '#3c4043',
  notification: '#f44336',
  tint: tintColorDark,
  tabIconDefault: '#9aa0a6',
  tabIconSelected: tintColorDark,
  primary: '#8ab4f8',
  secondary: '#9aa0a6',
  surface: '#1e1e1e',
  error: '#f44336',
  success: '#81c784',
  warning: '#ffb74d',
  info: '#4fc3f7',
  divider: 'rgba(255, 255, 255, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  isDark: true,
};

const Colors: ThemePalette = {
  light: lightColors,
  dark: darkColors,
};

export type ThemeMode = keyof typeof Colors;

export const getThemeColors = (mode: ThemeMode): ThemeColors => ({
  ...Colors[mode],
  isDark: mode === 'dark',
});

export default Colors;
