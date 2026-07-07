import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenContainerProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

/**
 * Shared layout for the boilerplate tab screens: a scrollable, theme-aware
 * container with a title, optional subtitle, and room for screen content.
 */
export function ScreenContainer({ title, subtitle, children }: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.six,
          paddingBottom: insets.bottom + Spacing.four,
        },
      ]}>
      <ThemedView style={styles.inner}>
        <ThemedText type="subtitle">{title}</ThemedText>
        {subtitle ? (
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
        {children}
      </ThemedView>
    </ScrollView>
  );
}

/** Simple themed card for grouping placeholder content on a screen. */
export function Card({ title, children }: { title: string; children?: ReactNode }) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.card, { borderColor: theme.border, shadowColor: theme.accent }]}>
      <View style={[styles.accentBar, { backgroundColor: theme.accent }]} />
      <ThemedText type="smallBold">{title}</ThemedText>
      {typeof children === 'string' ? (
        <ThemedText type="small" themeColor="textSecondary">
          {children}
        </ThemedText>
      ) : (
        children
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  accentBar: {
    width: 48,
    height: Spacing.one,
    borderRadius: Spacing.one,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: Spacing.two },
    shadowOpacity: 0.08,
    shadowRadius: Spacing.three,
    elevation: 2,
  },
  content: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  subtitle: {
    marginBottom: Spacing.two,
  },
});
