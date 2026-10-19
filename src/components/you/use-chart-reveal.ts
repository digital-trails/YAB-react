import { useEffect, useState } from 'react';
import { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

/** Drives a left-to-right SVG clip-path reveal once the chart's width is known. */
export function useChartReveal(duration = 900) {
  const [width, setWidth] = useState(0);
  const reveal = useSharedValue(0);

  useEffect(() => {
    if (width > 0) reveal.value = withTiming(width, { duration });
  }, [width, reveal, duration]);

  const revealProps = useAnimatedProps(() => ({ width: reveal.value }));
  return { width, setWidth, revealProps };
}
