// hooks/useThemeColor.ts
import { useThemeContext } from './ThemeContext';
import { Colors, ColorName } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const { theme, toggleTheme } = useThemeContext();
  
  const colorFromProps = props[theme];
  const color = colorFromProps ? colorFromProps : Colors[theme][colorName];

  return {
    color,
    theme,
    toggleTheme,
    getColor: (name: ColorName) => Colors[theme][name],
    colors: Colors[theme],
  };
}