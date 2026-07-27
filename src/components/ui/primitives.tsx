/**
 * Shared UI primitives.
 *
 * These correspond to the `.card`, `.tag`, `.btn`, `.seg` and progress-bar
 * classes from the design system stylesheet bundled in the handoff HTML.
 * Values are taken from that stylesheet, including its trailing override block
 * (which is what makes buttons, tags and segs pills rather than 16px rects).
 */

import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/ui/text';
import {
  Colors,
  FontFamily,
  FontSize,
  Radii,
  SelectedFill,
  Space,
  Spacing,
  Tracking,
  shadow,
  tracking,
} from '@/constants/tokens';
import type { Tint } from '@/data/content';

/** Resolves the design's rotating tint into its concrete colour roles. */
export const tintColors = (tint: Tint) => {
  switch (tint) {
    case 'accent':
      return { card: Colors.accent100, icon: Colors.accent200, text: Colors.accent700 };
    case 'accent2':
      return { card: Colors.accent2100, icon: Colors.accent2200, text: Colors.accent2700 };
    case 'neutral':
      return { card: Colors.neutral200, icon: Colors.neutral300, text: Colors.neutral800 };
  }
};

export function Card({
  children,
  style,
  loose,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Uses the wider 20px internal padding (hero and mood cards). */
  loose?: boolean;
}) {
  return (
    <View style={[styles.card, loose ? styles.cardLoose : null, shadow('sm'), style]}>
      {children}
    </View>
  );
}

/**
 * `.tag-accent` / `.tag-accent-2` / `.tag-neutral`. Note these use the 100-level
 * background with 800-level text, which is a different pairing from the
 * icon-avatar tints above — don't collapse the two.
 */
const TAG_COLORS: Record<Tint, { bg: string; text: string }> = {
  accent: { bg: Colors.accent100, text: Colors.accent800 },
  accent2: { bg: Colors.accent2100, text: Colors.accent2800 },
  neutral: { bg: Colors.neutral100, text: Colors.neutral800 },
};

export function Tag({ label, tint }: { label: string; tint: Tint }) {
  const { bg, text } = TAG_COLORS[tint];
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <AppText style={styles.tagLabel} color={text}>
        {label}
      </AppText>
    </View>
  );
}

/** Circular avatar holding a single letter, used across Library and Home rows. */
export function IconAvatar({
  letter,
  tint,
  size = 38,
}: {
  letter: string;
  tint: Tint;
  size?: number;
}) {
  const { icon, text } = tintColors(tint);
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: Radii.pill, backgroundColor: icon },
      ]}>
      <AppText
        style={{ fontFamily: FontFamily.heading, fontSize: size >= 44 ? 16 : 14 }}
        color={text}>
        {letter}
      </AppText>
    </View>
  );
}

/** Thin rounded progress bar. `percent` is 0–100. */
export function ProgressBar({ percent, color = Colors.accent2 }: { percent: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

export type PillButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onDark';

/**
 * `.btn-primary` / `.btn-secondary` / `.btn-ghost`, plus their `:active` fills.
 *
 * `onDark` has no counterpart in the stylesheet — see the note on the variant
 * below. It is composed only from existing tokens.
 */
const BTN_VARIANTS: Record<
  PillButtonVariant,
  { style: ViewStyle; label: string; pressed: ViewStyle }
> = {
  primary: {
    style: { backgroundColor: Colors.accent },
    label: Colors.bg,
    pressed: { backgroundColor: Colors.accent700 },
  },
  secondary: {
    style: { borderColor: Colors.divider },
    label: Colors.text,
    pressed: { backgroundColor: 'rgba(32, 30, 29, 0.14)' },
  },
  ghost: {
    style: { paddingHorizontal: Space[1] },
    label: Colors.accent,
    pressed: { backgroundColor: 'rgba(198, 113, 57, 0.18)' },
  },
  /**
   * For buttons sitting on a dark surface (the sage hero card). The design
   * reuses .btn-secondary there, which renders dark-on-dark at 2.57:1 — below
   * WCAG AA on the app's primary "I need help now" CTA. .btn-primary doesn't
   * fix it either: 3.03:1 label, and only 1.79:1 against the card, so the
   * button barely reads as a button. Every accent-ramp fill fails one or both,
   * because the ramp is mid-luminance and the card is dark.
   *
   * This uses --color-bg on --color-text — the same two tokens the card's own
   * title already uses — for 13.95:1 label and 5.43:1 against the card.
   */
  onDark: {
    style: { backgroundColor: Colors.bg, borderColor: Colors.bg },
    label: Colors.text,
    pressed: { backgroundColor: Colors.neutral200, borderColor: Colors.neutral200 },
  },
};

export function PillButton({
  label,
  onPress,
  variant = 'secondary',
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: PillButtonVariant;
  style?: StyleProp<ViewStyle>;
}) {
  const spec = BTN_VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.btn, spec.style, style, pressed ? spec.pressed : null]}>
      <AppText style={styles.btnLabel} color={spec.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * Dot-texture overlay for the stat cards. The design uses a CSS
 * `radial-gradient` dot pattern, which has no React Native equivalent — this
 * lays out a real 10px grid of 1.5px dots to reproduce it.
 */
export function DotTexture({ color, size = 10, dot = 1.5 }: { color: string; size?: number; dot?: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.dotGrid}>
        {Array.from({ length: 120 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: size,
              height: size,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: dot * 2,
                height: dot * 2,
                borderRadius: dot,
                backgroundColor: color,
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * `.seg` — a segmented filter control.
 *
 * One bordered pill split by hairline dividers, with the selected option filled
 * in accent. Sizes to its content (`align-self: flex-start` in the design), and
 * the options are content-width rather than equal columns.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View style={styles.seg} accessibilityRole="tablist">
      {options.map((option, i) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.key)}
            style={[
              styles.segOpt,
              i > 0 ? styles.segDivider : null,
              selected ? styles.segOptActive : null,
            ]}>
            {/*
              The design sets the selected label to --color-bg, which on the
              accent fill is 3.03:1 — the same failure as the hero button. Keeping
              the fill and darkening the label to --color-text gives 4.60:1.
              See SELECTED_LABEL in tokens.ts.
            */}
            <AppText
              style={styles.segLabel}
              color={selected ? SelectedFill.label : Colors.text}
              numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Settings toggle — a 42x24 track with a 20px knob sliding between 2px insets
 * over 150ms, per the design.
 */
export function Toggle({
  value,
  onValueChange,
  label,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  /** For screen readers, since the visible label lives in the row beside it. */
  label: string;
}) {
  const offset = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(offset, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value, offset]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[styles.toggleTrack, value ? styles.toggleTrackOn : styles.toggleTrackOff]}>
      <Animated.View
        style={[
          styles.toggleKnob,
          { left: offset.interpolate({ inputRange: [0, 1], outputRange: [2, 20] }) },
        ]}
      />
    </Pressable>
  );
}

/**
 * Row-end chevron. The prototype uses a "›" text glyph, which renders at a
 * different weight and baseline on every platform — this is a drawn equivalent
 * matched to its 16px size, using the same stroke treatment as the tab icons.
 */
export function Chevron({ color = Colors.neutral500, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m9 5 7 7-7 7"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Horizontally scrolling card rail.
 *
 * The design is `overflow-x: auto` with the scrollbar hidden, and bleeds past
 * the page margins so the next card peeks in as the affordance. That reads fine
 * on a touch screen, where it's a swipe — but on desktop web the wheel only
 * scrolls vertically and there's no visible scrollbar, so the rail looks stuck.
 * This translates vertical wheel input into horizontal scrolling on web, and
 * hands the gesture back to the page once the rail reaches either end so
 * hovering it doesn't trap the page scroll.
 */
export function CardRail({
  children,
  style,
  contentContainerStyle,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = ref.current?.getScrollableNode?.() as HTMLElement | undefined;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      // Leave real horizontal gestures (trackpads, tilt wheels) alone.
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (node.scrollWidth <= node.clientWidth) return;

      const atStart = node.scrollLeft <= 0;
      const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 1;
      if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) return;

      event.preventDefault();
      node.scrollLeft += event.deltaY;
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={contentContainerStyle}>
      {children}
    </ScrollView>
  );
}

/** Soft decorative circle that bleeds off a card corner. */
export function DecorCircle({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: Radii.pill,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.card,
    gap: Spacing.cardGap,
  },
  cardLoose: {
    padding: Spacing.cardLoose,
  },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  tagLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    letterSpacing: tracking(FontSize.caption, Tracking.tag),
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  progressTrack: {
    height: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.neutral300,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  // `.btn`: transparent background, 1px transparent border, pill radius from
  // the stylesheet's rounded-frame theme, and the *heading* font at 14px.
  btn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Space[2],
    paddingHorizontal: Space[3] * 1.2,
    borderRadius: Radii.pill,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnLabel: {
    fontFamily: FontFamily.heading,
    fontSize: FontSize.button,
    lineHeight: FontSize.button * 1.2,
  },
  dotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  seg: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Radii.pill,
  },
  segOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  segDivider: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.divider,
  },
  segOptActive: {
    backgroundColor: Colors.accent,
  },
  segLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.secondary,
  },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: Radii.pill,
    flexShrink: 0,
  },
  toggleTrackOn: {
    backgroundColor: SelectedFill.background,
  },
  // The design's off-track is neutral-300, which is 1.11:1 against the card and
  // 1.25:1 against the knob — the control is invisible and its state
  // unreadable. neutral-600 gives 3.21:1 and 3.61:1, both over WCAG 1.4.11's
  // 3:1 for component state. Matters most on the trusted-adult toggle, where
  // misreading the state has real privacy consequences.
  toggleTrackOff: {
    backgroundColor: Colors.neutral600,
  },
  toggleKnob: {
    position: 'absolute',
    top: 2,
    width: 20,
    height: 20,
    borderRadius: Radii.pill,
    backgroundColor: Colors.bg,
  },
});
