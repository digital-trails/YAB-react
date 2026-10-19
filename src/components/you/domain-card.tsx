import { Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { DOMAIN_COLORS, DOMAIN_EMOJIS } from '@/constants/patterns-visuals';
import { Palette, Radius, themedStyleSheet } from '@/constants/tokens';
import { buildDomainCounts } from '@/data/you-patterns';
import type { ModuleCompletion } from '@/data/module-history';

import { PatternCard } from './card';

const growKeyframe = new Keyframe({
  0: { transform: [{ scaleX: 0 }] },
  100: { transform: [{ scaleX: 1 }], easing: Easing.out(Easing.cubic) },
});

export function DomainCard({ activity }: { activity: ModuleCompletion[] }) {
  const items = buildDomainCounts(activity);
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <PatternCard title="What Comparison Is About" summary={items.length ? 'Topics from your recent comparison check-ins.' : 'Choose a comparison topic in Tune In to see it here.'}>
      {items.length ? (
        <View style={styles.rows}>
          {items.map((item, index) => {
            const color = DOMAIN_COLORS[index % DOMAIN_COLORS.length];
            const emoji = DOMAIN_EMOJIS[item.label] ?? '💬';
            return (
              <View key={item.label} style={styles.row}>
                <Text style={styles.emoji}>{emoji}</Text>
                <View style={styles.barColumn}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Text style={styles.value}>{item.value}</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: `${color}25` }]}>
                    <Animated.View entering={growKeyframe.duration(600).delay(index * 80)} style={[styles.fill, { width: `${(item.value / max) * 100}%`, backgroundColor: color, transformOrigin: 'left' }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.empty}>No topic data yet.</Text>
      )}
    </PatternCard>
  );
}

const styles = themedStyleSheet(() => ({
  rows: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji: { fontSize: 18, width: 22, textAlign: 'center' },
  barColumn: { flex: 1, gap: 5 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13, fontWeight: '600', color: Palette.text },
  value: { fontSize: 12, color: Palette.neutral700 },
  track: { height: 8, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  empty: { color: Palette.neutral700, fontSize: 12, lineHeight: 18, textAlign: 'center' },
}));
