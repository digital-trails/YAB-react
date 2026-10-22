// Display-only config (emoji, color, labels) for the "Your patterns" cards on
// the You screen. The underlying numbers always come from real check-ins
// (see src/data/you-patterns.ts) — this file only controls how they're drawn.

export type TimeBucketKey = 'morning' | 'afternoon' | 'evening' | 'night';

export type TimeBucketConfig = {
  key: TimeBucketKey;
  label: string;
  emoji: string;
  color: string;
  start: number;
  end: number;
};

/** Index N holds the display for mood level N + 1 (mood values run 1–5). */
export const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'] as const;
export const MOOD_COLORS = ['#E07B7B', '#E8A87C', '#D4C06E', '#8BC98B', '#6BB8C4'] as const;
export const MOOD_LABELS = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Very Good'] as const;

export const COMPARISON_LINE_COLOR = '#9B5DE5';
export const MOOD_LINE_COLOR = '#6BB8C4';

/** Bucket ranges are half-open [start, end); night wraps past midnight. */
export const TIME_BUCKETS: TimeBucketConfig[] = [
  { key: 'morning', label: 'Morning', emoji: '🌅', color: '#F9C74F', start: 5, end: 12 },
  { key: 'afternoon', label: 'Afternoon', emoji: '☀️', color: '#F4A261', start: 12, end: 17 },
  { key: 'evening', label: 'Evening', emoji: '🌆', color: '#9B5DE5', start: 17, end: 21 },
  { key: 'night', label: 'Night', emoji: '🌙', color: '#4361EE', start: 21, end: 5 },
];

export const DOMAIN_COLORS = ['#E07B7B', '#F4A261', '#9B5DE5', '#6BB8C4', '#8BC98B'];
export const DOMAIN_EMOJIS: Record<string, string> = {
  Appearance: '✨',
  Fitness: '💪',
  'Social Life': '👥',
  Accomplishments: '🏆',
  'Style / Fashion': '👗',
  Lifestyle: '🌿',
  School: '📚',
  Money: '💵',
};

/** Frequency dot color by same-day count: 0, 1, 2, 3+. */
export const FREQUENCY_DOT_COLORS = ['#E2DDD4', '#F4C06E', '#F4A261', '#E07B7B'] as const;
