import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Heading } from '@/components/ui';
import { useAppTheme } from '@/context/theme-context';
import { THEME_LABELS, THEMES, type ThemeName , themedStyleSheet } from '@/constants/tokens';
import { Palette, Radius } from '@/constants/tokens';

const THEME_DESCRIPTIONS: Record<ThemeName, string> = { warm: 'Earthy cream and olive', calm: 'Cool blue-green tones', dark: 'Deep surfaces and soft accents', colorful: 'Playful pink, coral, and violet' };

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeName, chooseTheme } = useAppTheme();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={10}><Ionicons name="chevron-back" size={24} color={Palette.neutral700} /></Pressable><Heading style={styles.title}>Settings</Heading><View style={styles.headerSpacer} /></View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.kicker}>APPEARANCE</Text>
        <Heading style={styles.sectionTitle}>Theme</Heading>
        <Text style={styles.subtitle}>Choose the colors you want to see throughout the app.</Text>
        <View style={styles.options}>
          {(Object.keys(THEMES) as ThemeName[]).map((name) => <Pressable key={name} onPress={() => chooseTheme(name)} style={[styles.option, themeName === name && styles.optionSelected]}>
            <View style={[styles.swatch, { backgroundColor: THEMES[name].bg, borderColor: THEMES[name].neutral300 }]}><View style={[styles.dot, { backgroundColor: THEMES[name].accent700 }]} /><View style={[styles.dot, { backgroundColor: THEMES[name].accent2_700 }]} /></View>
            <View style={styles.copy}><Text style={styles.optionTitle}>{THEME_LABELS[name]}</Text><Text style={styles.description}>{THEME_DESCRIPTIONS[name]}</Text></View><Text style={styles.check}>{themeName === name ? '✓' : ''}</Text>
          </Pressable>)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  screen: { flex: 1, backgroundColor: Palette.bg }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 }, headerSpacer: { width: 24 }, title: { flex: 1, fontSize: 22 }, content: { padding: 20, gap: 10 }, kicker: { marginTop: 4, color: Palette.accent2_700, fontSize: 12, fontWeight: '700', letterSpacing: 0.7 }, sectionTitle: { fontSize: 26, color: Palette.text }, subtitle: { color: Palette.neutral700, fontSize: 14, lineHeight: 20, marginBottom: 8 }, options: { gap: 10 }, option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100 }, optionSelected: { borderColor: Palette.accent2_700, backgroundColor: Palette.accent2_100 }, swatch: { width: 44, height: 44, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 5 }, dot: { width: 21, height: 7, borderRadius: Radius.pill }, copy: { flex: 1, gap: 3 }, optionTitle: { color: Palette.text, fontSize: 16, fontWeight: '700' }, description: { color: Palette.neutral700, fontSize: 12 }, check: { width: 22, color: Palette.accent2_700, fontSize: 20, textAlign: 'center', fontWeight: '800' },
}));
