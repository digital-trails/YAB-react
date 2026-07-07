/**
 * App color palette used across light and dark mode.
 * The accent colors use blue/amber tones so important UI states are not
 * distinguished by red/green differences alone.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#18212F',
    background: '#F7FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DDEBFF',
    textSecondary: '#52606D',
    accent: '#2563EB',
    accentSoft: '#DDEBFF',
    accentWarm: '#F59E0B',
    border: '#D8E1EC',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0B1220',
    backgroundElement: '#172033',
    backgroundSelected: '#1E3A5F',
    textSecondary: '#CBD5E1',
    accent: '#60A5FA',
    accentSoft: '#163457',
    accentWarm: '#FBBF24',
    border: '#2A3A52',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
