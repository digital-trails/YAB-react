/**
 * Design tokens for the teen social-comparison support app.
 *
 * Source of truth: the design-system stylesheet bundled inside
 * `Teen support app UI design/design_handoff_teen_support_app/Mental Health App.dc.html`.
 * Every value below is taken from that stylesheet — none are interpolated.
 *
 * The design is LIGHT-ONLY by decision: the handoff specifies a single warm
 * palette and no dark variants, so there is deliberately no light/dark split.
 */

import { Platform } from 'react-native';

export const Colors = {
  /** Page background. */
  bg: '#f5ead8',
  /** Card / raised surface. */
  surface: '#ebddc5',
  /** Primary text. */
  text: '#201e1d',
  /** --color-divider: color-mix(in srgb, #201e1d 16%, transparent). */
  divider: 'rgba(32, 30, 29, 0.16)',

  /** Accent — terracotta. */
  accent: '#c67139',
  accent100: '#fff2eb',
  accent200: '#ffe1d0',
  accent300: '#ffc6a5',
  accent400: '#f6a06b',
  accent500: '#d67f48',
  accent600: '#b2622d',
  accent700: '#8c491a',
  accent800: '#643312',
  accent900: '#402310',

  /** Accent 2 — sage. */
  accent2: '#7a8a5e',
  accent2100: '#f0fae1',
  accent2200: '#e1eecc',
  accent2300: '#ccdbb2',
  accent2400: '#aebf92',
  accent2500: '#8fa073',
  accent2600: '#728157',
  accent2700: '#56633f',
  accent2800: '#3d472b',
  accent2900: '#272e1b',

  /** Warm neutral ramp. */
  neutral100: '#f9f4ed',
  neutral200: '#eee7db',
  neutral300: '#dcd3c4',
  neutral400: '#c0b6a5',
  neutral500: '#a19786',
  neutral600: '#82796a',
  neutral700: '#645c50',
  neutral800: '#474238',
  neutral900: '#2e2b25',
} as const;

/**
 * The prototype's `color-mix()` results, which React Native cannot express.
 * The oklch mixes were computed by converting through OKLCh rather than
 * approximated in sRGB, so they match what a browser renders.
 */
export const Mixed = {
  /** color-mix(in oklch, accent 14%, bg) — mood check-in card background. */
  moodCardBg: '#eddac0',
  /** color-mix(in oklch, accent 20%, transparent) — mood card decorative circle. */
  moodCardCircle: 'rgba(198, 113, 57, 0.20)',
  /** color-mix(in oklch, accent 16%, bg) — "Need help now" banner background. */
  crisisBannerBg: '#ecd8bc',
  /** color-mix(in oklch, accent 35%, bg) — "Need help now" banner border. */
  crisisBannerBorder: '#e3c29d',
  /** color-mix(in oklch, accent-2 14%, transparent) — weekly chart decorative circle. */
  chartCircle: 'rgba(122, 138, 94, 0.14)',
  /** Dot-texture tints for the stat cards (radial-gradient dots @ 1.5px on a 10px grid). */
  dotAccent: 'rgba(198, 113, 57, 0.14)',
  dotAccent2: 'rgba(122, 138, 94, 0.16)',
  dotNeutral: 'rgba(130, 121, 106, 0.16)',
  /** Light overlays on the sage hero card. */
  heroCircleStrong: 'rgba(245, 234, 216, 0.10)',
  heroCircleSoft: 'rgba(245, 234, 216, 0.08)',
  heroBodyText: 'rgba(245, 234, 216, 0.85)',
} as const;

/**
 * The design's "selected chip" treatment — accent fill with a `--color-bg`
 * label — recurs on the mood pills and the segmented control, and measures
 * 3.03:1, below WCAG AA. This is the same failure as the hero button
 * (see PillButton's `onDark`): the accent ramp is mid-luminance, so it carries
 * neither light nor dark text comfortably.
 *
 * Keeping the accent fill and darkening the label to `--color-text` gives
 * 4.60:1 and changes only the text colour. Use this anywhere a control is
 * "selected" and filled with accent.
 */
export const SelectedFill = {
  background: '#c67139',
  /** --color-text on accent: 4.60:1. The design's --color-bg here is 3.03:1. */
  label: '#201e1d',
} as const;

export const Radii = {
  sm: 8,
  /** --radius-md: buttons and inputs (before the pill override). */
  md: 16,
  /** --radius-lg: cards and hero containers. */
  lg: 28,
  /**
   * The stylesheet's "rounded frame" theme softens cards to
   * calc(--radius-lg * 1.15), but every card in this design overrides that
   * inline back to --radius-lg, so `lg` is what actually renders.
   */
  cardTheme: 28 * 1.15,
  /** Pills, toggles, avatars — the theme sets .btn/.tag/.seg to 999px. */
  pill: 999,
} as const;

/**
 * Shadow scale — --shadow-sm/md/lg, all tinted with --color-neutral-900.
 *
 * React Native's `boxShadow` prop is New-Architecture Android only — it is NOT
 * supported on iOS or web — so the CSS shadows are translated per platform:
 *   - iOS:     shadowColor/Offset/Radius/Opacity (shadowRadius ≈ CSS blur / 2)
 *   - Android: elevation, approximated from the shadow's y-offset
 *   - Web:     boxShadow, which react-native-web maps straight to CSS
 */
const SHADOW_COLOR = Colors.neutral900;

type ShadowSpec = { y: number; blur: number; opacity: number; elevation: number };

const SHADOW_SPECS = {
  sm: { y: 1, blur: 2, opacity: 0.14, elevation: 1 },
  md: { y: 3, blur: 10, opacity: 0.16, elevation: 3 },
  lg: { y: 12, blur: 32, opacity: 0.22, elevation: 12 },
} as const satisfies Record<string, ShadowSpec>;

export type ShadowLevel = keyof typeof SHADOW_SPECS;

/** Platform-correct style object for a step on the design's shadow scale. */
export const shadow = (level: ShadowLevel) => {
  const { y, blur, opacity, elevation } = SHADOW_SPECS[level];
  return Platform.select({
    web: { boxShadow: `0px ${y}px ${blur}px rgba(46, 43, 37, ${opacity})` },
    android: { elevation, shadowColor: SHADOW_COLOR },
    default: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: y },
      shadowRadius: blur / 2,
      shadowOpacity: opacity,
    },
  });
};

export const FontFamily = {
  /** Caprasimo — screen titles, card titles, buttons, and all numeric stats. */
  heading: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodySemibold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
} as const;

/** Type scale, from the handoff and the prototype's inline styles. */
export const FontSize = {
  /** Screen title. */
  title: 26,
  /** Stat numbers, hero card headline. */
  headline: 20,
  heroTitle: 19,
  /** .btn */
  button: 14,
  body: 14,
  label: 13.5,
  secondary: 13,
  meta: 12.5,
  sectionLabel: 12,
  caption: 11,
  micro: 10.5,
  tiny: 10,
} as const;

/**
 * Letter spacing. The stylesheet gives these in em; React Native takes absolute
 * units, so they are multiplied by the font size at the call site.
 */
export const tracking = (fontSize: number, em: number) => fontSize * em;

export const Tracking = {
  kicker: 0.06,
  sectionLabel: 0.08,
  /** .tag */
  tag: 0.02,
} as const;

/** The design system's --space-N scale: a 4.4px base unit. */
export const Space = {
  1: 4.4,
  2: 8.8,
  3: 13.2,
  4: 17.6,
  5: 22,
  6: 26.4,
  7: 30.8,
  8: 35.2,
} as const;

/** Layout measurements taken from the prototype's inline styles. */
export const Spacing = {
  /** Gap between major sections on Home. */
  section: 22,
  /** Gap between sections on Library / You. */
  sectionTight: 20,
  /** Horizontal page padding. */
  page: 20,
  /** .card padding — var(--space-3). */
  card: Space[3],
  /** .card gap — var(--space-2). */
  cardGap: Space[2],
  cardLoose: 20,
  /** The crisis banner sets its own 16px padding inline, not the .card value. */
  banner: 16,
  rowGap: 14,
  gap: 12,
  gapSm: 10,
  gapXs: 8,
} as const;

/** Reference viewport from the design; layout must remain responsive to real device width. */
export const ReferenceViewport = { width: 390, height: 844 } as const;
