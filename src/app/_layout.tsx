import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { type ColorValue } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PhoneFrame } from '@/components/phone-frame';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IoniconName = keyof typeof Ionicons.glyphMap;

/** Per-tab icon, using the filled variant when the tab is active. */
function tabIcon(base: IoniconName) {
  return function TabBarIcon({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    const name = (focused ? base : `${base}-outline`) as IoniconName;
    return <Ionicons name={name} size={size} color={color} />;
  };
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PhoneFrame>
        <AnimatedSplashOverlay />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
              backgroundColor: colors.backgroundElement,
              borderTopColor: colors.border,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{ title: 'Home', tabBarIcon: tabIcon('home') }}
          />
          <Tabs.Screen
            name="explore"
            options={{ title: 'Explore', tabBarIcon: tabIcon('search') }}
          />
          <Tabs.Screen
            name="profile"
            options={{ title: 'Profile', tabBarIcon: tabIcon('person') }}
          />
          <Tabs.Screen
            name="settings"
            options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }}
          />
        </Tabs>
      </PhoneFrame>
    </ThemeProvider>
  );
}
