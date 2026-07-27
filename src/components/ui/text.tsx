/**
 * Typography primitive.
 *
 * Variants map 1:1 onto the type styles named in the design handoff, so screen
 * code reads in the design's vocabulary rather than in raw font sizes.
 */

import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Colors, FontFamily, FontSize, Tracking, tracking } from '@/constants/tokens';

export type TextVariant =
  /** Caprasimo 26px — screen titles. */
  | 'title'
  /** Caprasimo 19px — hero card headline. */
  | 'heroTitle'
  /** Caprasimo 20px — stat numbers. */
  | 'stat'
  /** Figtree 14px semibold — card titles, questions. */
  | 'body'
  /** Figtree 13.5px semibold — list row titles, settings rows. */
  | 'rowTitle'
  /** Figtree 13px — screen subtitles. */
  | 'subtitle'
  /** Figtree 12.5px — mood note, pill labels. */
  | 'note'
  /** Figtree 11px uppercase bold — card kicker labels ("EVERY DAY"). */
  | 'kicker'
  /** Figtree 12px uppercase — section labels ("Continue your practice"). */
  | 'sectionLabel'
  /** Figtree 11px — list row meta lines. */
  | 'meta'
  /** Figtree 10.5px — stat captions, tab labels. */
  | 'caption';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  /** Overrides the variant's default colour. */
  color?: string;
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  return <Text style={[styles[variant], color ? { color } : null, style]} {...rest} />;
}

const heading: TextStyle = {
  fontFamily: FontFamily.heading,
  color: Colors.text,
};

const styles = StyleSheet.create({
  title: { ...heading, fontSize: FontSize.title },
  heroTitle: { ...heading, fontSize: FontSize.heroTitle, color: Colors.bg },
  stat: { ...heading, fontSize: FontSize.headline },

  body: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.body,
    color: Colors.text,
  },
  rowTitle: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.label,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.secondary,
    color: Colors.neutral700,
  },
  note: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.meta,
    color: Colors.neutral700,
    lineHeight: FontSize.meta * 1.5,
  },
  kicker: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    color: Colors.accent700,
    textTransform: 'uppercase',
    letterSpacing: tracking(FontSize.caption, Tracking.kicker),
  },
  sectionLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sectionLabel,
    color: Colors.neutral700,
    textTransform: 'uppercase',
    letterSpacing: tracking(FontSize.sectionLabel, Tracking.sectionLabel),
  },
  meta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.caption,
    color: Colors.neutral700,
  },
  caption: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.micro,
    color: Colors.neutral700,
  },
});
