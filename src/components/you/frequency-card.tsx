import { Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { FREQUENCY_DOT_COLORS } from '@/constants/patterns-visuals';
import { Palette, Radius, themedStyleSheet } from '@/constants/tokens';
import { buildFrequencyDays } from '@/data/you-patterns';
import type { ModuleCompletion } from '@/data/module-history';

import { PatternCard } from './card';

export function FrequencyCard({ activity }: { activity: ModuleCompletion[] }) {
  const days = buildFrequencyDays(activity);
  const activeDays = days.filter((day) => day.count > 0).length;
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return (
    <PatternCard title="Comparison This Week" summary={activeDays ? `You noticed comparison on ${activeDays} ${activeDays === 1 ? 'day' : 'days'} this week.` : 'Complete Tune In check-ins to track comparison frequency.'}>
      <View style={styles.row}>
        {days.map((day, index) => {
          const dotColor = FREQUENCY_DOT_COLORS[Math.min(day.count, FREQUENCY_DOT_COLORS.length - 1)];
          return (
            <View key={index} style={styles.column}>
              <View style={styles.dots}>
                {day.count > 0
                  ? Array.from({ length: Math.min(day.count, 4) }, (_, dot) => (
                      <Animated.View key={dot} entering={ZoomIn.delay(dot * 90).duration(250)} style={[styles.dot, { backgroundColor: dotColor }]} />
                    ))
                  : <View style={styles.dotEmpty} />}
              </View>
              <Text style={styles.label}>{day.label}</Text>
            </View>
          );
        })}
      </View>
      {total > 0 ? (
        <View style={styles.callout}>
          <Text style={styles.calloutIcon}>📊</Text>
          <Text style={styles.calloutText}>{total} comparison {total === 1 ? 'moment' : 'moments'} total this week</Text>
        </View>
      ) : null}
    </PatternCard>
  );
}

const styles = themedStyleSheet(() => ({
  row: { flexDirection: 'row', justifyContent: 'space-between', height: 100 },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  dots: { height: 72, justifyContent: 'flex-end', gap: 5, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotEmpty: { width: 12, height: 12, borderRadius: 6, backgroundColor: Palette.neutral300, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Palette.neutral600 },
  label: { fontSize: 11, color: Palette.neutral700 },
  callout: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Palette.neutral200, borderRadius: Radius.lg, paddingVertical: 10, paddingHorizontal: 12 },
  calloutIcon: { fontSize: 16 },
  calloutText: { fontSize: 12, color: Palette.neutral700, flexShrink: 1 },
}));
