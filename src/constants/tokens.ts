import { StyleSheet } from 'react-native';

export type ThemeName = 'warm' | 'calm' | 'dark' | 'colorful';

export type ThemePalette = {
  bg: string;
  text: string;
  accent: string;
  accent100: string;
  accent200: string;
  accent700: string;
  accent800: string;
  accent2: string;
  accent2_100: string;
  accent2_200: string;
  accent2_700: string;
  accent2_800: string;
  neutral100: string;
  neutral200: string;
  neutral300: string;
  neutral600: string;
  neutral700: string;
  neutral800: string;
  quoteBg: string;
  quoteCircle: string;
  tuneInBg: string;
  tuneInCircle: string;
  shiftItBg: string;
  shiftItPanel: string;
  pickupBg: string;
  statBg: string;
  statDot: string;
};

const warm: ThemePalette = {
  bg: '#ECE6D8', text: '#2E2A22', accent: '#B26A34', accent100: '#F5F0E6', accent200: '#E6C9A8',
  accent700: '#A85D2A', accent800: '#8A4A20', accent2: '#7C8A5A', accent2_100: '#E4EAD6',
  accent2_200: '#CFE0C4', accent2_700: '#5B6440', accent2_800: '#434B2E', neutral100: '#F5F0E6',
  neutral200: '#E9DFCB', neutral300: '#DCCFB4', neutral600: '#8A8172', neutral700: '#6E665A',
  neutral800: '#4A4033', quoteBg: '#E6DBC4', quoteCircle: '#DBCBA6', tuneInBg: '#5B6440',
  tuneInCircle: 'rgba(233, 238, 214, 0.12)', shiftItBg: '#F5F1E8', shiftItPanel: 'rgba(255, 255, 255, 0.45)',
  pickupBg: '#E9DFCB', statBg: '#E7DCC6', statDot: 'rgba(120, 105, 80, 0.32)',
};

const calm: ThemePalette = {
  bg: '#E8F1F2', text: '#173B43', accent: '#D66A5E', accent100: '#F8E5E1', accent200: '#F0C0B8',
  accent700: '#B94C44', accent800: '#8F3733', accent2: '#5EA3A3', accent2_100: '#D9EEEE',
  accent2_200: '#BFE1DE', accent2_700: '#347779', accent2_800: '#24585B', neutral100: '#F4F9F9',
  neutral200: '#DCEBED', neutral300: '#C2D6D9', neutral600: '#6A858A', neutral700: '#4D6A70',
  neutral800: '#2D5057', quoteBg: '#D8E9EA', quoteCircle: '#BBDADC', tuneInBg: '#347779',
  tuneInCircle: 'rgba(220, 245, 244, 0.16)', shiftItBg: '#F4F9F9', shiftItPanel: 'rgba(255, 255, 255, 0.55)',
  pickupBg: '#DCEBED', statBg: '#D5E7E8', statDot: 'rgba(55, 109, 113, 0.28)',
};

const dark: ThemePalette = {
  bg: '#1D2221', text: '#F4EFE5', accent: '#E08A52', accent100: '#3A302A', accent200: '#77523A',
  accent700: '#F09A5E', accent800: '#FFC08E', accent2: '#9EAF70', accent2_100: '#30382B',
  accent2_200: '#465437', accent2_700: '#A8BC76', accent2_800: '#D1E49B', neutral100: '#272D2B',
  neutral200: '#303734', neutral300: '#46504B', neutral600: '#A5AEA4', neutral700: '#C2C9BF',
  neutral800: '#E0E3D8', quoteBg: '#30332D', quoteCircle: '#4D4C36', tuneInBg: '#4D6038',
  tuneInCircle: 'rgba(230, 243, 190, 0.12)', shiftItBg: '#272D2B', shiftItPanel: 'rgba(255, 255, 255, 0.08)',
  pickupBg: '#303734', statBg: '#303734', statDot: 'rgba(190, 205, 165, 0.28)',
};

const colorful: ThemePalette = {
  bg: '#FFF1F7', text: '#3D244C', accent: '#F06478', accent100: '#FFE0E9', accent200: '#F8B7C8',
  accent700: '#D94461', accent800: '#A62D4A', accent2: '#6C63D9', accent2_100: '#E7E4FF',
  accent2_200: '#C8C4F5', accent2_700: '#5149B4', accent2_800: '#393287', neutral100: '#FFF9FC',
  neutral200: '#F6DDE9', neutral300: '#EAC4D5', neutral600: '#98728A', neutral700: '#75556C',
  neutral800: '#563B50', quoteBg: '#FFE0D5', quoteCircle: '#FFC0A9', tuneInBg: '#5149B4',
  tuneInCircle: 'rgba(255, 255, 255, 0.18)', shiftItBg: '#FFF9FC', shiftItPanel: 'rgba(255, 210, 229, 0.55)',
  pickupBg: '#F6DDE9', statBg: '#FFE5D8', statDot: 'rgba(217, 68, 97, 0.26)',
};

export const THEMES: Record<ThemeName, ThemePalette> = { warm, calm, dark, colorful };
export const THEME_LABELS: Record<ThemeName, string> = { warm: 'Warm', calm: 'Calm', dark: 'Dark', colorful: 'Colorful' };

let activeTheme: ThemeName = 'warm';
const subscribers = new Set<() => void>();

export function getThemeName() { return activeTheme; }
export function getPalette() { return THEMES[activeTheme]; }
export function setActiveTheme(theme: ThemeName) {
  activeTheme = theme;
  subscribers.forEach((listener) => listener());
}
export function subscribeTheme(listener: () => void) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function themedStyleSheet(factory: () => object): any {
  let cachedTheme: ThemeName | null = null;
  let cachedStyles: Record<string, unknown> = {};
  return new Proxy({}, {
    get(_, key: string) {
      if (cachedTheme !== activeTheme) {
        cachedTheme = activeTheme;
        cachedStyles = StyleSheet.create(factory() as any) as Record<string, unknown>;
      }
      return cachedStyles[key];
    },
  });
}

export const Palette = new Proxy({} as ThemePalette, {
  get(_, key: keyof ThemePalette) { return getPalette()[key]; },
});

export const Radius = { sm: 12, lg: 24, xl: 30, pill: 999 } as const;
export const Shadow = new Proxy({} as { elevSm: string; lg: string }, {
  get(_, key: 'elevSm' | 'lg') {
    const color = getThemeName() === 'dark' ? '0, 0, 0' : '46, 42, 34';
    return key === 'elevSm' ? `0px 2px 8px rgba(${color}, 0.06)` : `0px 10px 24px rgba(${color}, 0.12)`;
  },
});
export const HeadingFont = 'Caprasimo, Georgia, serif';
