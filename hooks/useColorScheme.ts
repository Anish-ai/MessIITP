import { useThemeContext } from './ThemeContext';
import { Colors, ColorName } from '@/constants/Colors';

export function useColorScheme() {
  const { theme } = useThemeContext();
  return {
    theme,
    colors: Colors[theme],
    getColor: (name: ColorName) => Colors[theme][name],
  };
}