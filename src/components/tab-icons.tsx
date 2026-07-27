/**
 * Tab bar icons.
 *
 * These are the prototype's hand-drawn SVG paths ported verbatim rather than
 * approximated with an icon library, so the design's line weight and roundness
 * survive exactly. The handoff permits swapping in the team's icon set later
 * (Lucide-style) as long as stroke-width 2.75 and the rounded caps are kept.
 */

import Svg, { Circle, Path } from 'react-native-svg';

export type TabIconProps = {
  color: string;
  size?: number;
};

const STROKE_WIDTH = 2.75;

const svgProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
});

const strokeProps = (color: string) => ({
  stroke: color,
  strokeWidth: STROKE_WIDTH,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HomeIcon({ color, size = 20 }: TabIconProps) {
  return (
    <Svg {...svgProps(size)}>
      <Path d="M3 11.5 12 4l9 7.5" {...strokeProps(color)} />
      <Path d="M5.5 9.5V20h13V9.5" {...strokeProps(color)} />
    </Svg>
  );
}

export function LibraryIcon({ color, size = 20 }: TabIconProps) {
  return (
    <Svg {...svgProps(size)}>
      <Path
        d="M12 6.5c-1.6-1.2-3.7-1.8-6.5-1.8v13.6c2.8 0 4.9.6 6.5 1.8 1.6-1.2 3.7-1.8 6.5-1.8V4.7c-2.8 0-4.9.6-6.5 1.8Z"
        {...strokeProps(color)}
      />
      <Path d="M12 6.5v13.6" {...strokeProps(color)} />
    </Svg>
  );
}

export function YouIcon({ color, size = 20 }: TabIconProps) {
  return (
    <Svg {...svgProps(size)}>
      <Circle cx={12} cy={8} r={3.5} {...strokeProps(color)} />
      <Path d="M5 19.5c1.3-3.2 3.9-5 7-5s5.7 1.8 7 5" {...strokeProps(color)} />
    </Svg>
  );
}
