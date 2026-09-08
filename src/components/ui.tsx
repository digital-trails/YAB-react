import { type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  Text,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';

import { HeadingFont, Palette, Radius , themedStyleSheet } from '@/constants/tokens';

/** Display heading in Caprasimo (`--font-heading`). */
export function Heading({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[styles.heading, style]} />;
}

type BtnVariant = 'primary' | 'secondary' | 'ghost';

type BtnProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: BtnVariant;
  /** Left-align the label rather than centering it (used on the primary CTA). */
  alignStart?: boolean;
};

/**
 * Shared button. `secondary` is the cream-on-teal button used inside the
 * support CTA; `ghost` is the quiet text button ("Resume"); `primary` is the
 * solid accent-2 action used through the survey flow.
 */
export function Btn({ label, variant = 'primary', alignStart, style, ...rest }: BtnProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={(state) => [
        styles.btn,
        alignStart ? styles.btnStart : styles.btnCenter,
        variantStyles(variant),
        state.pressed && styles.btnPressed,
        typeof style === 'function' ? style(state) : style,
      ]}>
      <Text style={[styles.btnLabel, variantLabel(variant)]}>{label}</Text>
    </Pressable>
  );
}

/** Small category tag ("Tune In" / "Shift It") shown on recommendation cards. */
export function Tag({ children, tone }: { children: ReactNode; tone: 'accent' | 'accent2' }) {
  const isAccent = tone === 'accent';
  return (
    <Text
      style={[
        styles.tag,
        {
          backgroundColor: isAccent ? Palette.accent : Palette.accent2,
          color: Palette.bg,
        },
      ]}>
      {children}
    </Text>
  );
}

/**
 * Repeating dot texture, matching `radial-gradient(<tint> 1.5px, transparent
 * 1.5px)` at a 10px grid. Rendered as a wrapped grid of tiny dots so it works
 * on native and web alike; the parent must clip with `overflow: 'hidden'`.
 */
export function DotTexture({ color, count = 180 }: { color: string; count?: number }) {
  return (
    <View style={styles.dotLayer} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.dotCell}>
          <View style={[styles.dot, { backgroundColor: color }]} />
        </View>
      ))}
    </View>
  );
}

function variantStyles(variant: BtnVariant): ViewStyle {
  if (variant === 'primary') return { backgroundColor: Palette.accent2_700 };
  if (variant === 'secondary') return { backgroundColor: Palette.bg };
  return { backgroundColor: 'transparent', borderWidth: 1, borderColor: Palette.neutral300 };
}

function variantLabel(variant: BtnVariant): TextStyle {
  if (variant === 'primary') return { color: Palette.bg };
  if (variant === 'secondary') return { color: Palette.accent2_700 };
  return { color: Palette.accent2_700 };
}

const styles = themedStyleSheet(() => ({
  heading: {
    fontFamily: HeadingFont,
    color: Palette.text,
  },
  btn: {
    borderRadius: Radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  btnCenter: { alignItems: 'center' },
  btnStart: { alignItems: 'flex-start' },
  btnPressed: { opacity: 0.85 },
  btnLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  tag: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    borderRadius: Radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  dotLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dotCell: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
}));
