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
  const [version, refresh] = useState(0);
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
  const value = useMemo(() => ({
    themeName: getThemeName(),
    palette: getPalette(),
    ready,
    needsSetup,
    chooseTheme: (theme: ThemeName) => {
      setActiveTheme(theme);
      setNeedsSetup(false);
      void saveTheme(theme);
    },
  }), [needsSetup, ready, version, getThemeName(), getPalette()]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
}
