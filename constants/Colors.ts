// constants/Colors.ts
export const tintColorLight = '#FF7031'; // Orange for light mode
export const tintColorDark = '#ff6622'; // Darker orange for dark mode

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    cardBackground: '#F8F9FA',
    border: '#E0E0E0',
    unfocused: '#E0E0E0',
    lessDarkBackground: '#F2F2F2',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    veg: '#7CFF9A',
    nonVeg: '#FF7C7C',
  },
  dark: {
    text: '#ECEDEE',
    background: '#222222',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    cardBackground: '#1E1E1E',
    border: '#333333',
    unfocused: '#333333',
    lessDarkBackground: '#2A2A2A',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    veg: '#004A11',
    nonVeg: '#790000',
  },
} as const;

export type ThemeType = 'light' | 'dark';
export type ColorScheme = typeof Colors.light;
export type ColorName = keyof ColorScheme;