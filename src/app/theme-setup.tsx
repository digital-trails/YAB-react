import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heading } from '@/components/ui';
import { useAppTheme } from '@/context/theme-context';
import { THEME_LABELS, THEMES, type ThemeName , themedStyleSheet } from '@/constants/tokens';
import { Palette, Radius } from '@/constants/tokens';

const THEME_DESCRIPTIONS: Record<ThemeName, string> = {
  warm: 'Earthy cream, olive, and terracotta tones.',
  calm: 'Cool blue-green tones for a quieter feel.',
  dark: 'Deep surfaces with warm, easy-on-the-eyes accents.',
  colorful: 'Playful pink, coral, and violet tones.',
};

export default function ThemeSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeName, chooseTheme } = useAppTheme();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.kicker}>WELCOME</Text>
        <Heading style={styles.title}>Choose your look</Heading>
        <Text style={styles.subtitle}>Pick the colors that feel right for you. You can change this anytime in Settings.</Text>
        <View style={styles.options}>
          {(Object.keys(THEMES) as ThemeName[]).map((name) => (
            <Pressable key={name} onPress={() => chooseTheme(name)} style={[styles.option, themeName === name && styles.optionSelected]}>
              <View style={[styles.swatch, { backgroundColor: THEMES[name].bg, borderColor: THEMES[name].neutral300 }]}>
                <View style={[styles.swatchDot, { backgroundColor: THEMES[name].accent700 }]} />
                <View style={[styles.swatchDot, { backgroundColor: THEMES[name].accent2_700 }]} />
              </View>
              <View style={styles.optionCopy}><Text style={styles.optionTitle}>{THEME_LABELS[name]}</Text><Text style={styles.optionDescription}>{THEME_DESCRIPTIONS[name]}</Text></View>
              <Text style={styles.check}>{themeName === name ? '✓' : ''}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={styles.continue}>
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  screen: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, gap: 16, justifyContent: 'center', flexGrow: 1 },
  kicker: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700', letterSpacing: 0.7 },
  title: { color: Palette.text, fontSize: 28 },
  subtitle: { color: Palette.neutral700, fontSize: 15, lineHeight: 22 },
  options: { gap: 10, marginTop: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, padding: 12 },
  optionSelected: { borderColor: Palette.accent2_700, backgroundColor: Palette.accent2_100 },
  swatch: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  swatchDot: { width: 22, height: 8, borderRadius: Radius.pill },
  optionCopy: { flex: 1, gap: 3 },
  optionTitle: { color: Palette.text, fontSize: 16, fontWeight: '700' },
  optionDescription: { color: Palette.neutral700, fontSize: 12, lineHeight: 17 },
  check: { width: 22, color: Palette.accent2_700, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  continue: { backgroundColor: Palette.accent2_700, borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  continueText: { color: Palette.bg, fontSize: 15, fontWeight: '800' },
}));
