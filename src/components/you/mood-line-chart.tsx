import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Circle, ClipPath, Defs, G, LinearGradient, Path, Rect, Stop, Svg } from 'react-native-svg';

import { MOOD_COLORS, MOOD_EMOJIS } from '@/constants/patterns-visuals';
import { Palette, themedStyleSheet } from '@/constants/tokens';
import { formatChartLabel } from '@/data/you-patterns';

import { buildSmoothPath, splitDefinedRuns, type ChartPoint } from './chart-path';
import { useChartReveal } from './use-chart-reveal';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const HEIGHT = 110;
const PAD_X = 14;
const PAD_TOP = 24;
const PAD_BOTTOM = 10;

export function MoodLineChart({ dates, points }: { dates: string[]; points: (number | null)[] }) {
  const { width, setWidth, revealProps } = useChartReveal();
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  if (width === 0) return <View style={styles.chart} onLayout={onLayout} />;

  const innerWidth = width - PAD_X * 2;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = dates.length > 1 ? innerWidth / (dates.length - 1) : 0;

  const coords: (ChartPoint | null)[] = points.map((mood, index) => {
    if (mood === null) return null;
    const t = (mood - 1) / 4;
    return { x: PAD_X + stepX * index, y: PAD_TOP + (1 - t) * innerHeight };
  });

  return (
    <View>
      <View style={styles.chart} onLayout={onLayout}>
        <Svg width={width} height={HEIGHT}>
          <Defs>
            <LinearGradient id="moodLine" x1={0} y1={0} x2={width} y2={0} gradientUnits="userSpaceOnUse">
              {points.map((mood, index) => (
                <Stop
                  key={index}
                  offset={dates.length > 1 ? index / (dates.length - 1) : 0}
                  stopColor={mood ? MOOD_COLORS[mood - 1] : Palette.neutral300}
                />
              ))}
            </LinearGradient>
            <ClipPath id="moodReveal">
              <AnimatedRect x={0} y={0} height={HEIGHT} animatedProps={revealProps} />
            </ClipPath>
          </Defs>
          <G clipPath="url(#moodReveal)">
            {splitDefinedRuns(coords).map((run) => (
              <Path
                key={`${run.start}-${run.end}`}
                d={buildSmoothPath(coords.slice(run.start, run.end + 1) as ChartPoint[])}
                stroke="url(#moodLine)"
                strokeWidth={2.5}
                strokeLinecap="round"
                fill="none"
              />
            ))}
            {coords.map((point, index) => point && (
              <Circle key={index} cx={point.x} cy={point.y} r={5} fill={Palette.bg} stroke={MOOD_COLORS[points[index]! - 1]} strokeWidth={2} />
            ))}
          </G>
        </Svg>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {coords.map((point, index) => point && (
            <Animated.View key={index} entering={ZoomIn.delay(index * 90).duration(280)} style={[styles.emoji, { left: point.x - 10, top: point.y - 28 }]}>
              <Text style={styles.emojiText}>{MOOD_EMOJIS[points[index]! - 1]}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
      <View style={styles.axisRow}>
        {dates.map((date, index) => (
          <Text key={date} style={styles.axisLabel} numberOfLines={1}>{formatChartLabel(date, index, dates.length)}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  chart: { height: HEIGHT },
  emoji: { position: 'absolute', width: 20, alignItems: 'center' },
  emojiText: { fontSize: 14 },
  axisRow: { flexDirection: 'row' },
  axisLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: Palette.neutral700 },
}));
