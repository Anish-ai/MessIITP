// hooks/useThemeColor.ts

import { Colors } from '@/constants/Colors';
import { useState } from 'react';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Default to dark theme

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const colorFromProps = props[theme];

  const color = colorFromProps ? colorFromProps : Colors[theme][colorName];

  return { color, theme, toggleTheme };
}