import { Text, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { ClipPath, Defs, G, Path, Rect, Svg } from 'react-native-svg';

import { COMPARISON_LINE_COLOR, MOOD_LINE_COLOR } from '@/constants/patterns-visuals';
import { Palette, themedStyleSheet } from '@/constants/tokens';
import type { ComparisonPoint } from '@/data/you-patterns';

import { buildSmoothPath, type ChartPoint } from './chart-path';
import { useChartReveal } from './use-chart-reveal';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const HEIGHT = 110;
const PAD_X = 10;
const PAD_TOP = 14;
const PAD_BOTTOM = 10;

export function CorrelationChart({ points }: { points: ComparisonPoint[] }) {
  const { width, setWidth, revealProps } = useChartReveal();
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  if (width === 0) return <View style={styles.chart} onLayout={onLayout} />;

  const innerWidth = width - PAD_X * 2;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const peakComparison = Math.max(...points.map((point) => point.comparison), 1);

  const toCoord = (index: number, value: number, max: number): ChartPoint => ({
    x: PAD_X + stepX * index,
    y: PAD_TOP + (1 - value / max) * innerHeight,
  });

  const comparisonCoords = points.map((point, index) => toCoord(index, point.comparison, peakComparison));
  const moodCoords = points.map((point, index) => toCoord(index, point.mood, 5));

  return (
    <View>
      <View style={styles.chart} onLayout={onLayout}>
        <Svg width={width} height={HEIGHT}>
          <Defs>
            <ClipPath id="correlationReveal">
              <AnimatedRect x={0} y={0} height={HEIGHT} animatedProps={revealProps} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#correlationReveal)">
            <Path d={buildSmoothPath(comparisonCoords)} stroke={COMPARISON_LINE_COLOR} strokeWidth={2.5} strokeLinecap="round" fill="none" />
            <Path d={buildSmoothPath(moodCoords)} stroke={MOOD_LINE_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="6 4" fill="none" />
          </G>
        </Svg>
      </View>
      <View style={styles.axisRow}>
        {points.map((point, index) => <Text key={index} style={styles.axisLabel}>{point.label}</Text>)}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.swatch, { backgroundColor: COMPARISON_LINE_COLOR }]} /><Text style={styles.legendText}>Comparison</Text></View>
        <View style={styles.legendItem}><View style={[styles.swatch, styles.swatchDashed, { borderColor: MOOD_LINE_COLOR }]} /><Text style={styles.legendText}>Mood</Text></View>
      </View>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  chart: { height: HEIGHT },
  axisRow: { flexDirection: 'row' },
  axisLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: Palette.neutral700 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 16, height: 3, borderRadius: 2 },
  swatchDashed: { backgroundColor: 'transparent', borderTopWidth: 2, borderStyle: 'dashed' },
  legendText: { fontSize: 12, color: Palette.neutral700 },
}));
