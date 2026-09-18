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

/** Convert `#rgb` / `#rrggbb` to space-separated RGB channels for NativeWind alpha utilities. */
function hexToRgbChannels(hex: string): string {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return '0 0 0';
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

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
    '--color-primary': hexToRgbChannels(palette.primary),
    '--color-on-primary': hexToRgbChannels(palette.onPrimary),
    '--color-bg': hexToRgbChannels(palette.bg),
    '--color-surface': hexToRgbChannels(palette.surface),
    '--color-surface-2': hexToRgbChannels(palette.surface2),
    '--color-fg': hexToRgbChannels(palette.fg),
    '--color-muted': hexToRgbChannels(palette.muted),
    '--color-border': hexToRgbChannels(palette.border),
  });
}
