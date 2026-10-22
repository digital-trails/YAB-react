import { Text, View } from 'react-native';

import { Heading } from '@/components/ui';
import { Palette, Radius, Shadow, themedStyleSheet } from '@/constants/tokens';
import { formatTime, relativeDay, type Range } from '@/data/you-patterns';
import type { ModuleCompletion } from '@/data/module-history';

export function ActivityFeed({ activity }: { activity: ModuleCompletion[] }) {
  const groups = [...activity]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .reduce<Record<string, ModuleCompletion[]>>((result, entry) => {
      const group = relativeDay(entry.completedAt);
      (result[group] ??= []).push(entry);
      return result;
    }, {});

  return (
    <>
      {Object.entries(groups).map(([group, entries]) => (
        <View key={group} style={styles.entryGroup}>
          <Text style={styles.day}>{group}</Text>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Heading style={styles.entryTitle}>{entry.title}</Heading>
              {entry.body ? <Text style={styles.response}>{entry.body}</Text> : null}
              <Text style={styles.time}>{formatTime(entry.completedAt)}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

export function EmptyActivity({ range }: { range: Range }) {
  const label = range === 7 ? 'week' : range === 30 ? '30 days' : 'selected dates';
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>✦</Text>
      <Heading style={styles.emptyTitle}>Nothing here yet</Heading>
      <Text style={styles.emptyBody}>Finish a Library activity and it will show up in your past {label}.</Text>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  entryGroup: { gap: 7 },
  day: { fontSize: 12, fontWeight: '700', color: Palette.neutral700, textTransform: 'uppercase', letterSpacing: 0.8 },
  entry: { gap: 7, padding: 14, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, boxShadow: Shadow.elevSm },
  entryTitle: { fontSize: 18, color: Palette.text },
  response: { fontSize: 14, lineHeight: 21, color: Palette.text },
  time: { fontSize: 11, color: Palette.neutral700 },
  empty: { alignItems: 'center', gap: 8, padding: 24, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300 },
  emptyIcon: { color: Palette.accent2_700, fontSize: 26 },
  emptyTitle: { fontSize: 18, color: Palette.text },
  emptyBody: { color: Palette.neutral700, fontSize: 13, lineHeight: 19, textAlign: 'center' },
}));
