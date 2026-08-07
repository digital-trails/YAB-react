/**
 * Design tokens for the YAB "Align" home experience.
 *
 * Palette is an earthy scheme taken from the reference mock: a warm cream
 * background, olive-green primary (Tune In), terracotta/rust accent (streaks,
 * Resume, active tab), and warm tan neutrals for cards and stat tiles.
 */

export const Palette = {
  bg: '#ECE6D8', // warm cream
  text: '#2E2A22', // dark warm brown-black

  // Accent — terracotta / rust (streaks, Resume link, active tab).
  accent: '#B26A34',
  accent100: '#F5F0E6', // light cream (active tab pill)
  accent200: '#E6C9A8',
  accent700: '#A85D2A',
  accent800: '#8A4A20',

  // Accent 2 — olive green (Tune In, progress, calm family).
  accent2: '#7C8A5A', // lighter olive (progress fill)
  accent2_100: '#E4EAD6',
  accent2_200: '#CFE0C4', // mint (practice avatar)
  accent2_700: '#5B6440', // deep olive (Tune In button)
  accent2_800: '#434B2E',

  // Warm neutrals.
  neutral100: '#F5F0E6',
  neutral200: '#E9DFCB',
  neutral300: '#DCCFB4',
  neutral600: '#8A8172',
  neutral700: '#6E665A',
  neutral800: '#4A4033',

  // Home-specific surfaces.
  quoteBg: '#E6DBC4',
  quoteCircle: '#DBCBA6',
  tuneInBg: '#5B6440',
  tuneInCircle: 'rgba(233, 238, 214, 0.12)',
  shiftItBg: '#F5F1E8',
  shiftItPanel: 'rgba(255, 255, 255, 0.45)',
  pickupBg: '#E9DFCB',
  statBg: '#E7DCC6',
  statDot: 'rgba(120, 105, 80, 0.32)',
} as const;

export const Radius = {
  sm: 12,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;

/**
 * Cross-platform shadows. RN 0.76+ supports the `boxShadow` string prop on all
 * platforms (the web phone-frame already relies on it).
 */
export const Shadow = {
  elevSm: '0px 2px 8px rgba(46, 42, 34, 0.06)',
  lg: '0px 10px 24px rgba(46, 42, 34, 0.12)',
} as const;

/** Heading face loaded at runtime; falls back to a serif until Caprasimo loads. */
export const HeadingFont = 'Caprasimo, Georgia, serif';
