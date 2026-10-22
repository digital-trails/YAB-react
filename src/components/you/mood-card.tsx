import { Pressable, Text, View } from 'react-native';

import { Palette, Radius, themedStyleSheet } from '@/constants/tokens';
import type { DateRange, Range } from '@/data/you-patterns';

import { PatternCard } from './card';
import { CustomRangePicker } from './custom-range-picker';
import { MoodLineChart } from './mood-line-chart';

export function MoodCard({
  dates,
  points,
  range,
  onRangeChange,
  customRange,
  onCustomRangeChange,
}: {
  dates: string[];
  points: (number | null)[];
  range: Range;
  onRangeChange: (range: Range) => void;
  customRange: DateRange | null;
  onCustomRangeChange: (range: DateRange | null) => void;
}) {
  const filled = points.filter((point) => point !== null).length;

  return (
    <PatternCard title="How You've Been Feeling" summary="Your mood check-ins over time.">
      <View style={styles.rangeToggle}>
        {(['7', '30', 'custom'] as const).map((option) => {
          const value: Range = option === '7' ? 7 : option === '30' ? 30 : 'custom';
          return (
            <Pressable key={option} onPress={() => onRangeChange(value)} style={[styles.rangeOption, range === value && styles.rangeActive]}>
              <Text style={range === value ? styles.rangeActiveText : styles.rangeText}>{option === 'custom' ? 'Dates' : `${option} days`}</Text>
            </Pressable>
          );
        })}
      </View>
      {range === 'custom' ? <CustomRangePicker value={customRange} onChange={onCustomRangeChange} /> : null}
      <MoodLineChart dates={dates} points={points} />
      {filled ? null : <Text style={styles.noData}>No mood check-ins in this range yet. Complete the mood question in Tune In to see your check-ins here.</Text>}
    </PatternCard>
  );
}

const styles = themedStyleSheet(() => ({
  rangeToggle: { flexDirection: 'row', alignSelf: 'stretch', backgroundColor: Palette.neutral200, borderRadius: Radius.pill, overflow: 'hidden' },
  rangeOption: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 6 },
  rangeText: { color: Palette.neutral700, fontSize: 12, fontWeight: '700' },
  rangeActive: { backgroundColor: Palette.text, borderRadius: Radius.pill },
  rangeActiveText: { color: Palette.bg, fontSize: 12, fontWeight: '700' },
  noData: { color: Palette.neutral700, fontSize: 12, lineHeight: 18, textAlign: 'center' },
}));
