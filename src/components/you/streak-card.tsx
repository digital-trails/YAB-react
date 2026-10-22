import { Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Heading } from '@/components/ui';
import { Palette, themedStyleSheet } from '@/constants/tokens';
import { currentWeekKeys, localDateKey, WEEK_LABELS } from '@/data/you-patterns';

import { Card } from './card';

export function StreakCard({ activityDays, currentRun, longestRun }: { activityDays: Set<string>; currentRun: number; longestRun: number }) {
  const todayKey = localDateKey(new Date());
  const week = currentWeekKeys();

  return (
    <Card>
      <Heading style={styles.title}>{currentRun ? `🔥 ${currentRun} ${currentRun === 1 ? 'Day' : 'Days'} in a Row` : 'Ready to start a streak?'}</Heading>
      <Text style={styles.subtitle}>{currentRun ? "Keep it up, you're on a roll!" : 'Complete a module today to begin.'}</Text>
      <View style={styles.weekRow}>
        {week.map((date, index) => {
          const done = activityDays.has(date);
          return (
            <View key={date} style={styles.weekDayCol}>
              <Animated.View entering={done ? ZoomIn.delay(index * 70).duration(300) : undefined} style={[styles.weekDot, done ? styles.weekDotDone : styles.weekDotEmpty, date === todayKey && styles.weekDotToday]}>
                {done ? <Text style={styles.weekCheck}>✓</Text> : null}
              </Animated.View>
              <Text style={[styles.weekLabel, date === todayKey && styles.weekLabelToday]}>{WEEK_LABELS[index]}</Text>
            </View>
          );
        })}
      </View>
      {longestRun > 1 ? <Text style={styles.longest}>🏆 Longest Chain: {longestRun}</Text> : null}
    </Card>
  );
}

const styles = themedStyleSheet(() => ({
  title: { fontSize: 19, color: Palette.text },
  subtitle: { fontSize: 13.5, color: Palette.neutral700, lineHeight: 19 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  weekDayCol: { alignItems: 'center', gap: 6 },
  weekDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  weekDotDone: { backgroundColor: Palette.accent2_700 },
  weekDotEmpty: { backgroundColor: Palette.neutral300 },
  weekDotToday: { borderWidth: 2, borderColor: Palette.text },
  weekCheck: { color: Palette.bg, fontWeight: '800' },
  weekLabel: { color: Palette.neutral700, fontSize: 11, fontWeight: '700' },
  weekLabelToday: { color: Palette.text },
  longest: { fontSize: 13, fontWeight: '600', color: Palette.accent },
}));
