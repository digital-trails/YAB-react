import { Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { Palette, themedStyleSheet } from '@/constants/tokens';
import { buildTimeBucketCounts } from '@/data/you-patterns';
import type { ModuleCompletion } from '@/data/module-history';

import { PatternCard } from './card';

const growKeyframe = new Keyframe({
  0: { transform: [{ scaleY: 0 }] },
  100: { transform: [{ scaleY: 1 }], easing: Easing.out(Easing.cubic) },
});

export function TimeCard({ activity }: { activity: ModuleCompletion[] }) {
  const buckets = buildTimeBucketCounts(activity);
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
  const max = Math.max(...buckets.map((bucket) => bucket.value), 1);

  return (
    <PatternCard
      title="When Comparison Shows Up"
      summary={total ? 'Most of your comparison moments, by time of day.' : 'When you complete Tune In, your check-in time appears here.'}>
      <View style={styles.row}>
        {buckets.map((bucket) => {
          const percent = total ? Math.round((bucket.value / total) * 100) : 0;
          const heightPercent = (bucket.value / max) * 100;
          return (
            <View key={bucket.label} style={styles.column}>
              <Text style={[styles.percent, { color: bucket.color }]}>{percent}%</Text>
              <View style={[styles.track, { backgroundColor: `${bucket.color}30` }]}>
                <Animated.View entering={growKeyframe.duration(600)} style={[styles.fill, { height: `${heightPercent}%`, backgroundColor: bucket.color, transformOrigin: 'bottom' }]} />
              </View>
              <Text style={styles.emoji}>{bucket.emoji}</Text>
              <Text style={styles.label}>{bucket.label}</Text>
            </View>
          );
        })}
      </View>
    </PatternCard>
  );
}

const styles = themedStyleSheet(() => ({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', gap: 6, height: 120 },
  column: { flex: 1, alignItems: 'center', gap: 6 },
  percent: { fontSize: 12, fontWeight: '700' },
  track: { width: '100%', maxWidth: 28, height: 56, borderRadius: 14, overflow: 'hidden', justifyContent: 'flex-end' },
  fill: { width: '100%', borderRadius: 14 },
  emoji: { fontSize: 18 },
  label: { fontSize: 10, textAlign: 'center', color: Palette.neutral700 },
}));
