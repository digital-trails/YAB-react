import '@/global.css';

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import * as SplashScreen from 'expo-splash-screen';

import { PhoneFrame } from '@/components/phone-frame';
import { TABS, TabBar } from '@/components/ui/tab-bar';
import { Colors } from '@/constants/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fonts are bundled, not fetched at runtime — the handoff calls for this
  // explicitly so the app stays usable offline.
  const [loaded, error] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <PhoneFrame>
      <View style={styles.root}>
        <Tabs>
          {/*
            TabSlot's own container is `flexShrink: 0`, so without this a tall
            scrolling screen expands it and pushes the tab bar out of view.
          */}
          <TabSlot style={styles.slot} />
          <TabBar />
          {/*
            Route definitions for the custom tab bar above. `TabList` is the
            configuration source; hiding it keeps the stock bar from rendering.
          */}
          <TabList style={styles.hidden}>
            {TABS.map(({ name, href }) => (
              <TabTrigger key={name} name={name} href={href} />
            ))}
          </TabList>
        </Tabs>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  slot: {
    flexShrink: 1,
    minHeight: 0,
  },
  hidden: {
    display: 'none',
  },
});
