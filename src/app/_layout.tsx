import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PhoneFrame } from '@/components/phone-frame';
import { Palette } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // `--font-heading` (Caprasimo) is loaded at runtime from Google Fonts. We do
  // not gate rendering on it — the heading style falls back to a serif until it
  // resolves, then swaps in automatically.
  useFonts({
    Caprasimo:
      'https://raw.githubusercontent.com/google/fonts/main/ofl/caprasimo/Caprasimo-Regular.ttf',
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PhoneFrame>
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Palette.bg },
          }}>
          <Stack.Screen name="(tabs)" />
          {/* Full-screen flows pushed over the tab bar. */}
          <Stack.Screen name="tune-in" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="library-flow" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="goals-flow" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="accomplishments-flow" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="community-flow" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      </PhoneFrame>
    </ThemeProvider>
  );
}
