import { type ReactNode } from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import { useAppSelector } from '../store';
import { selectCatalogMode, selectTheme } from '../store/slices/uiSlice';
import { getPalette, themeVars } from './tokens';

const FOOD_THEME_PATHS = ['/cart', '/checkout'];

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const catalogMode = useAppSelector(selectCatalogMode);
  const theme = useAppSelector(selectTheme);
  const pathname = usePathname();
  const forceFood = FOOD_THEME_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const palette = getPalette(theme, forceFood ? 'food' : catalogMode);

  return (
    <View style={themeVars(palette)} className="flex-1 bg-bg">
      {children}
    </View>
  );
}

export function usePalette() {
  const catalogMode = useAppSelector(selectCatalogMode);
  const theme = useAppSelector(selectTheme);
  const pathname = usePathname();
  const forceFood = FOOD_THEME_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  return getPalette(theme, forceFood ? 'food' : catalogMode);
}
