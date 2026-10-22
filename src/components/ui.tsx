import { Ionicons } from '@expo/vector-icons';
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

import { HeadingFont, Palette, Radius, Shadow, themedStyleSheet } from '@/constants/tokens';

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

/**
 * Shared flow-screen header: circular back button on the left, a centered
 * title (or custom `middle` content, e.g. a progress bar) in between, and an
 * optional circular close button on the right. Keeps navigation chrome
 * consistent across every full-screen flow instead of each one hand-rolling
 * its own back/close glyphs.
 */
export function FlowHeader({
  title,
  onBack,
  onClose,
  middle,
}: {
  title?: string;
  onBack: () => void;
  onClose?: () => void;
  middle?: ReactNode;
}) {
  return (
    <View style={styles.flowHeader}>
      <Pressable accessibilityRole="button" onPress={onBack} hitSlop={10} style={styles.flowHeaderBtn}>
        <Ionicons name="chevron-back" size={22} color={Palette.neutral700} />
      </Pressable>
      {middle ?? (title ? (
        <Heading style={styles.flowHeaderTitle} numberOfLines={1}>{title}</Heading>
      ) : (
        <View style={styles.flowHeaderFlex} />
      ))}
      {onClose ? (
        <Pressable accessibilityRole="button" onPress={onClose} hitSlop={10} style={styles.flowHeaderBtn}>
          <Ionicons name="close" size={22} color={Palette.neutral700} />
        </Pressable>
      ) : (
        <View style={styles.flowHeaderSpacer} />
      )}
    </View>
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
  if (variant === 'primary') return { backgroundColor: Palette.accent2_700, boxShadow: Shadow.elevSm };
  if (variant === 'secondary') return { backgroundColor: Palette.bg, boxShadow: Shadow.elevSm };
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
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  flowHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.neutral100,
  },
  flowHeaderSpacer: { width: 36, height: 36 },
  flowHeaderFlex: { flex: 1 },
  flowHeaderTitle: {
    flex: 1,
    fontSize: 18,
    color: Palette.text,
    textAlign: 'center',
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
