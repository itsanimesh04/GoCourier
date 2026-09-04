import { vars } from 'nativewind';
import type { CatalogMode, ThemeMode } from '../store/slices/uiSlice';

export const FOOD_RED = '#ff0040';
export const EXTRAS_LIME = '#c8f542';
export const EXTRAS_INK = '#6b9100';
export const RAZORPAY_THEME = '#D4FF4F';

export type Palette = {
  primary: string;
  onPrimary: string;
  bg: string;
  surface: string;
  surface2: string;
  fg: string;
  muted: string;
  border: string;
  primaryInk: string;
};

const darkSurfaces = {
  bg: '#0a0a0b',
  surface: '#141416',
  surface2: '#1c1c20',
  fg: '#f4f4f5',
  muted: '#a1a1aa',
  border: '#2a2a30',
};

const lightSurfaces = {
  bg: '#f4f4f5',
  surface: '#ffffff',
  surface2: '#ececee',
  fg: '#18181b',
  muted: '#71717a',
  border: '#e4e4e7',
};

export function getPalette(theme: ThemeMode, catalogMode: CatalogMode): Palette {
  const surfaces = theme === 'light' ? lightSurfaces : darkSurfaces;
  const extras = catalogMode === 'extras';
  return {
    ...surfaces,
    primary: extras ? EXTRAS_LIME : FOOD_RED,
    onPrimary: extras ? '#0a0a0b' : '#ffffff',
    primaryInk: extras && theme === 'light' ? EXTRAS_INK : extras ? EXTRAS_LIME : FOOD_RED,
  };
}

export function themeVars(palette: Palette) {
  return vars({
    '--color-primary': palette.primary,
    '--color-on-primary': palette.onPrimary,
    '--color-bg': palette.bg,
    '--color-surface': palette.surface,
    '--color-surface-2': palette.surface2,
    '--color-fg': palette.fg,
    '--color-muted': palette.muted,
    '--color-border': palette.border,
  });
}
