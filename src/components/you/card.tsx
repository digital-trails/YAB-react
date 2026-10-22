import { type ReactNode } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Heading } from '@/components/ui';
import { Palette, Radius, Shadow, themedStyleSheet } from '@/constants/tokens';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PatternCard({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return (
    <Card>
      <Heading style={styles.cardTitle}>{title}</Heading>
      <Text style={styles.cardSubtitle}>{summary}</Text>
      {children}
    </Card>
  );
}

const styles = themedStyleSheet(() => ({
  card: { gap: 12, padding: 18, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, boxShadow: Shadow.elevSm },
  cardTitle: { fontSize: 19, color: Palette.text },
  cardSubtitle: { fontSize: 13.5, color: Palette.neutral700, lineHeight: 19 },
}));
