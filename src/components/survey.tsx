import { Host, Slider as ExpoSlider } from '@expo/ui';
import { type ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Heading } from '@/components/ui';
import { Palette, Radius, Shadow , themedStyleSheet } from '@/constants/tokens';

/** Question header: kicker + title + optional helper/subtitle. */
export function QuestionHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.headerBlock}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Heading style={styles.title}>{title}</Heading>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/** Horizontal N-point scale with optional emoji glyphs and end labels. */
export function ScaleInput({
  points,
  value,
  onChange,
  emojis,
  minLabel,
  maxLabel,
}: {
  points: number;
  value: number | null;
  onChange: (v: number) => void;
  emojis?: string[];
  minLabel?: string;
  maxLabel?: string;
}) {
  return (
    <View style={styles.scaleBlock}>
      <View style={styles.scaleRow}>
        {Array.from({ length: points }, (_, i) => i + 1).map((n) => {
          const selected = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              style={[styles.scaleDot, selected ? styles.scaleDotOn : styles.scaleDotOff]}>
              {emojis ? (
                <Text style={styles.scaleEmoji}>{emojis[n - 1]}</Text>
              ) : (
                <Text style={[styles.scaleNum, selected && styles.scaleNumOn]}>{n}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
      {minLabel || maxLabel ? (
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleEndLabel}>{minLabel}</Text>
          <Text style={styles.scaleEndLabel}>{maxLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** A configurable numeric slider with a live value, endpoint glyphs, and short labels. */
export function RatingSlider({
  value,
  onChange,
  minEmoji,
  maxEmoji,
  minLabel,
  maxLabel,
  min = 1,
  max = 100,
}: {
  value: number;
  onChange: (v: number) => void;
  minEmoji: string;
  maxEmoji: string;
  minLabel: string;
  maxLabel: string;
  min?: number;
  max?: number;
}) {
  return (
    <View style={styles.ratingBlock}>
      <Text style={styles.ratingValue}>{value}</Text>
      <Host style={styles.ratingHost} matchContents>
        <ExpoSlider value={value} min={min} max={max} step={1} onValueChange={onChange} />
      </Host>
      <View style={styles.ratingEnds}>
        <View style={styles.ratingEnd}>
          <Text style={styles.ratingEmoji}>{minEmoji}</Text>
          <Text style={styles.scaleEndLabel}>{minLabel}</Text>
        </View>
        <View style={styles.ratingEnd}>
          <Text style={styles.ratingEmoji}>{maxEmoji}</Text>
          <Text style={[styles.scaleEndLabel, styles.ratingEndRight]}>{maxLabel}</Text>
        </View>
      </View>
    </View>
  );
}

/** Single-choice list of stacked option rows. */
export function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.optionList}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.option, selected && styles.optionOn]}>
            <Text style={[styles.optionText, selected && styles.optionTextOn]}>{opt}</Text>
            <View style={[styles.radio, selected && styles.radioOn]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Multi-choice list; toggles membership in `values`. */
export function MultiSelect({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <View style={styles.optionList}>
      {options.map((opt) => {
        const selected = values.includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => onToggle(opt)}
            style={[styles.option, selected && styles.optionOn]}>
            <Text style={[styles.optionText, selected && styles.optionTextOn]}>{opt}</Text>
            <View style={[styles.checkbox, selected && styles.checkboxOn]}>
              {selected ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Open-ended multiline text field. */
export function TextField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={Palette.neutral600}
      multiline
      style={styles.textField}
    />
  );
}

/** Suggestion chips (e.g. emotion words) that append to a text answer. */
export function Chips({ items, onPick }: { items: string[]; onPick: (v: string) => void }) {
  return (
    <View style={styles.chipRow}>
      {items.map((item) => (
        <Pressable key={item} onPress={() => onPick(item)} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Collapsible "What does this mean?" info panel. */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <View style={styles.infoNote}>
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  headerBlock: { gap: 8 },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    color: Palette.accent2_700,
  },
  title: { fontSize: 22, color: Palette.text, lineHeight: 28 },
  subtitle: { fontSize: 13.5, color: Palette.neutral700, lineHeight: 20 },

  scaleBlock: { gap: 8 },
  ratingBlock: { gap: 8 },
  ratingValue: {
    alignSelf: 'center',
    fontSize: 32,
    fontWeight: '700',
    color: Palette.accent2_800,
  },
  ratingHost: { width: '100%', minHeight: 36 },
  ratingEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingEnd: { alignItems: 'center', gap: 4, maxWidth: '42%' },
  ratingEndRight: { textAlign: 'right' },
  ratingEmoji: { fontSize: 26 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  scaleDot: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scaleDotOff: { backgroundColor: Palette.neutral100, borderColor: Palette.neutral300 },
  scaleDotOn: { backgroundColor: Palette.accent2, borderColor: Palette.accent2 },
  scaleEmoji: { fontSize: 22 },
  scaleNum: { fontSize: 15, fontWeight: '700', color: Palette.neutral700 },
  scaleNumOn: { color: Palette.bg },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleEndLabel: { fontSize: 11.5, color: Palette.neutral600 },

  optionList: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 15,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.neutral300,
    backgroundColor: Palette.neutral100,
  },
  optionOn: { borderColor: Palette.accent2, backgroundColor: Palette.accent2_100 },
  optionText: { flex: 1, fontSize: 14.5, color: Palette.text },
  optionTextOn: { fontWeight: '600', color: Palette.accent2_800 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Palette.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: Palette.accent2 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.accent2 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Palette.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { borderColor: Palette.accent2, backgroundColor: Palette.accent2 },
  checkmark: { color: Palette.bg, fontSize: 13, fontWeight: '700', lineHeight: 16 },

  textField: {
    minHeight: 96,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.neutral300,
    backgroundColor: Palette.neutral100,
    padding: 14,
    fontSize: 14.5,
    color: Palette.text,
    textAlignVertical: 'top',
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.accent2_200,
    backgroundColor: Palette.accent2_100,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: { fontSize: 12.5, color: Palette.accent2_800, fontWeight: '600' },

  infoNote: {
    borderRadius: Radius.lg,
    backgroundColor: Palette.accent2_100,
    padding: 14,
    boxShadow: Shadow.elevSm,
  },
  infoText: { fontSize: 13, color: Palette.accent2_800, lineHeight: 19 },
}));
