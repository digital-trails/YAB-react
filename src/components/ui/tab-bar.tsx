/**
 * Bottom tab bar.
 *
 * The design puts a rounded accent pill *behind both the icon and its label*
 * when a tab is active, which the stock tab bar can't express — so this uses
 * Expo Router's headless `expo-router/ui` tabs with fully custom triggers.
 */

import { forwardRef } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';

import { HomeIcon, LibraryIcon, YouIcon, type TabIconProps } from '@/components/tab-icons';
import { AppText } from '@/components/ui/text';
import { Colors, FontFamily, FontSize, Radii } from '@/constants/tokens';

type TabDef = {
  name: string;
  /** Literal route, kept explicit so Expo Router's typed routes can check it. */
  href: '/' | '/library' | '/you';
  label: string;
  Icon: (props: TabIconProps) => React.ReactElement;
};

export const TABS: TabDef[] = [
  { name: 'home', href: '/', label: 'Home', Icon: HomeIcon },
  { name: 'library', href: '/library', label: 'Library', Icon: LibraryIcon },
  { name: 'you', href: '/you', label: 'You', Icon: YouIcon },
];

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  Icon: (props: TabIconProps) => React.ReactElement;
};

const TabButton = forwardRef<View, TabButtonProps>(function TabButton(
  { label, Icon, isFocused, style, ...rest },
  ref
) {
  const color = isFocused ? Colors.accent700 : Colors.neutral600;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      // Incoming style goes first: TabTrigger supplies its own layout (row
      // direction), which would otherwise override the design's stacked tab.
      style={[
        style as ViewStyle,
        styles.tab,
        isFocused ? styles.tabActive : null,
      ]}
      {...rest}>
      <Icon color={color} size={20} />
      <AppText style={styles.tabLabel} color={color}>
        {label}
      </AppText>
    </Pressable>
  );
});

export function TabBar() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: 20 + insets.bottom }]}>
      {TABS.map(({ name, label, Icon }) => (
        <TabTrigger key={name} name={name} asChild>
          <TabButton label={label} Icon={Icon} />
        </TabTrigger>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.neutral300,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 6,
    borderRadius: Radii.md,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.accent100,
  },
  tabLabel: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.micro,
  },
});
