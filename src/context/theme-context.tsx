import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getPalette, getThemeName, setActiveTheme, subscribeTheme, type ThemeName, type ThemePalette } from '@/constants/tokens';
import { getSavedTheme, saveTheme } from '@/data/theme-preferences';

type ThemeContextValue = {
  themeName: ThemeName;
  palette: ThemePalette;
  ready: boolean;
  needsSetup: boolean;
  chooseTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [, refresh] = useState(0);
  const [ready, setReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  useEffect(() => {
    const unsubscribe = subscribeTheme(() => refresh((value) => value + 1));
    void getSavedTheme().then((theme) => {
      if (theme) setActiveTheme(theme);
      else setNeedsSetup(true);
      setReady(true);
    });
    return () => { unsubscribe(); };
  }, []);
  // Read outside the memo so these are simple dependency-array expressions;
  // `refresh` above re-renders this component whenever the theme changes,
  // which is what keeps these reads fresh.
  const themeName = getThemeName();
  const palette = getPalette();
  const value = useMemo(() => ({
    themeName,
    palette,
    ready,
    needsSetup,
    chooseTheme: (theme: ThemeName) => {
      setActiveTheme(theme);
      setNeedsSetup(false);
      void saveTheme(theme);
    },
  }), [needsSetup, palette, ready, themeName]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
}
