import type { ThemeName } from '@/constants/tokens';

const STORAGE_KEY = 'yab-theme';

export async function getSavedTheme(): Promise<ThemeName | null> {
  if (typeof localStorage === 'undefined') return null;
  const value = localStorage.getItem(STORAGE_KEY);
  return isThemeName(value) ? value : null;
}

export async function saveTheme(theme: ThemeName): Promise<void> {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, theme);
}

function isThemeName(value: unknown): value is ThemeName {
  return value === 'warm' || value === 'calm' || value === 'dark' || value === 'colorful';
}
