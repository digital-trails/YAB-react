import { Ionicons } from '@expo/vector-icons';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type Ref } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// On web the headless `expo-router/ui` Tabs wrap each screen in a
// `flexShrink: 0` container, so the screen grows to its content height and the
// inner ScrollView never gets a bounded height to scroll within. Force the slot
// to fill the frame and own the vertical scroll instead.
const webSlotStyle =
  Platform.OS === 'web' ? ({ flex: 1, minHeight: 0, overflowY: 'auto' } as const) : undefined;

import { Palette, Radius } from '@/constants/tokens';

type IoniconName = keyof typeof Ionicons.glyphMap;

type TabButtonProps = TabTriggerSlotProps & {
  icon: IoniconName;
  label: string;
};

/**
 * Custom tab item per the spec: active items get the accent icon + label on a
 * `--color-accent-100` pill; inactive items are `--color-neutral-600` on a
 * transparent background.
 */
const TabButton = forwardRef(function TabButton(
  { icon, label, isFocused, ...pressProps }: TabButtonProps,
  ref: Ref<View>,
) {
  const tint = isFocused ? Palette.accent700 : Palette.neutral600;

  return (
    <Pressable
      ref={ref}
      {...pressProps}
      style={[styles.tab, isFocused && styles.tabActive]}>
      <Ionicons name={icon} size={20} color={tint} />
      <Text style={[styles.tabLabel, { color: tint }]}>{label}</Text>
    </Pressable>
  );
});

export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot style={webSlotStyle} />
      <TabList asChild>
        <View style={styles.bar}>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="library" href="/library" asChild>
            <TabButton icon="book" label="Library" />
          </TabTrigger>
          <TabTrigger name="you" href="/you" asChild>
            <TabButton icon="person" label="You" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.neutral300,
    backgroundColor: Palette.bg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Palette.accent100,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
