import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as RouterThemeProvider, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PhoneFrame } from '@/components/phone-frame';
import { Palette } from '@/constants/tokens';
import { ThemeProvider, useAppTheme } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFonts({ Caprasimo: 'https://raw.githubusercontent.com/google/fonts/main/ofl/caprasimo/Caprasimo-Regular.ttf' });
  return <ThemeProvider><AppShell colorScheme={colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : null} /></ThemeProvider>;
}

function AppShell({ colorScheme }: { colorScheme: 'light' | 'dark' | null | undefined }) {
  const router = useRouter();
  const { ready, needsSetup, themeName } = useAppTheme();
  useEffect(() => {
    if (ready && needsSetup) router.replace('/theme-setup');
  }, [needsSetup, ready, router]);
  if (!ready) return null;
  return (
    <RouterThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PhoneFrame key={themeName}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Palette.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="theme-setup" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="tune-in" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="library-flow" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="goals-flow" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="accomplishments-flow" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="community-flow" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </PhoneFrame>
    </RouterThemeProvider>
  );
}
