import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DotTexture, Heading } from '@/components/ui';
import { getModuleCompletions, getModuleDraft, type ModuleCompletion, type ModuleDraft } from '@/data/module-history';
import { Palette, Radius, Shadow } from '@/constants/tokens';

const STAT_COLORS = [Palette.accent700, Palette.accent2_700, Palette.neutral800];

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState([0, 0, 0]);
  const [draft, setDraft] = useState<ModuleDraft | null>(null);

  const loadHomeData = useCallback(async () => {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    const completions = await getModuleCompletions(since);
    setStats([calculateStreak(completions), completions.length, calculateMinutes(completions)]);
    setDraft(await getModuleDraft());
  }, []);

  useFocusEffect(useCallback(() => {
    void loadHomeData();
  }, [loadHomeData]));

  const statItems = ['day streak', 'sessions', 'min practiced'].map((caption, index) => ({ value: String(stats[index]), caption, color: STAT_COLORS[index] }));
  const resume = () => {
    if (draft) router.push({ pathname: draft.route as never, params: { resume: '1' } });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Logo / wordmark */}
      <View style={styles.logoRow}>
        <Image
          style={styles.logoMark}
          source={require('@/assets/images/align-tune.svg')}
          contentFit="contain"
        />
        <Heading style={styles.logo} numberOfLines={1}>
          No Comparison
        </Heading>
      </View>

      {/* Greeting */}
      <Heading style={styles.greeting} numberOfLines={1}>
        Good afternoon Maya
      </Heading>

      {/* Quote card */}
      <View style={styles.quoteCard}>
        <View style={styles.quoteCircle} pointerEvents="none" />
        <Text style={styles.quoteText}>&ldquo;Comparison is the thief of joy&rdquo;</Text>
        <Text style={styles.quoteAuthor}>-Teddy Roosevelt</Text>
      </View>

      {/* TUNE IN — primary action */}
      <Pressable
        onPress={() => router.push('/tune-in')}
        style={({ pressed }) => [styles.tuneIn, pressed && styles.pressed]}>
        <View style={[styles.tuneCircle, styles.tuneCircleA]} pointerEvents="none" />
        <View style={[styles.tuneCircle, styles.tuneCircleB]} pointerEvents="none" />
        <Text style={styles.tuneLabel}>TUNE IN</Text>
        <Ionicons name="play" size={26} color={Palette.bg} />
      </Pressable>

      {/* SHIFT IT — secondary action */}
      <Pressable
        onPress={() => router.push('/library')}
        style={({ pressed }) => [styles.shiftIt, pressed && styles.pressed]}>
        <View style={styles.shiftPanel} pointerEvents="none" />
        <Text style={styles.shiftLabel}>SHIFT IT</Text>
        <Ionicons name="play" size={26} color={Palette.text} />
      </Pressable>

      {/* Pick up where you left off */}
      {draft ? <View style={styles.section}>
        <Text style={styles.sectionLabel}>PICK UP WHERE YOU LEFT OFF</Text>
        <View style={styles.pickupCard}>
          <View style={styles.avatar}><Heading style={styles.avatarLetter}>N</Heading></View>
          <View style={styles.pickupBody}>
            <Text style={styles.pickupTitle}>{draft.title}</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round((draft.step / Math.max(draft.totalSteps - 1, 1)) * 100)}%` }]} /></View>
          </View>
          <Pressable hitSlop={8} onPress={resume}><Text style={styles.resume}>Resume</Text></Pressable>
        </View>
      </View> : null}

      {/* This week */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <View style={styles.statsRow}>
          {statItems.map((stat) => (
            <View key={stat.caption} style={styles.statTile}>
              <DotTexture color={Palette.statDot} />
              <Heading style={[styles.statValue, { color: stat.color }]}>{stat.value}</Heading>
              <Text style={styles.statCaption}>{stat.caption}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Palette.bg },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 18,
  },
  pressed: { opacity: 0.9 },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 2,
  },
  logoMark: { width: 28, height: 28 },
  logo: { fontSize: 22, color: Palette.text },
  greeting: { fontSize: 19, color: Palette.text },

  // Quote card
  quoteCard: {
    backgroundColor: Palette.quoteBg,
    borderRadius: Radius.xl,
    paddingVertical: 28,
    paddingHorizontal: 24,
    overflow: 'hidden',
    boxShadow: Shadow.elevSm,
  },
  quoteCircle: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Palette.quoteCircle,
  },
  quoteText: { fontSize: 16, color: Palette.text, lineHeight: 23, fontWeight: '500' },
  quoteAuthor: {
    fontSize: 16,
    color: Palette.text,
    lineHeight: 23,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 6,
  },

  // TUNE IN
  tuneIn: {
    backgroundColor: Palette.tuneInBg,
    borderRadius: Radius.xl,
    height: 70,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    boxShadow: Shadow.lg,
  },
  tuneCircle: { position: 'absolute', borderRadius: 999, backgroundColor: Palette.tuneInCircle },
  tuneCircleA: { width: 200, height: 200, right: -30, top: -40 },
  tuneCircleB: { width: 130, height: 130, left: 60, bottom: -60 },
  tuneLabel: { fontSize: 16, fontWeight: '800', color: Palette.bg, letterSpacing: 0.5 },

  // SHIFT IT
  shiftIt: {
    backgroundColor: Palette.shiftItBg,
    borderRadius: Radius.xl,
    height: 70,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    boxShadow: Shadow.elevSm,
  },
  shiftPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    backgroundColor: Palette.shiftItPanel,
  },
  shiftLabel: { fontSize: 16, fontWeight: '800', color: Palette.text, letterSpacing: 0.5 },

  // Sections
  section: { gap: 12, marginTop: 4 },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.96,
    color: Palette.neutral700,
    fontWeight: '600',
  },

  // Pick up
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Palette.pickupBg,
    borderRadius: Radius.lg,
    padding: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.accent2_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 18, color: Palette.accent2_700 },
  pickupBody: { flex: 1, gap: 10 },
  pickupTitle: { fontSize: 12, fontWeight: '700', color: Palette.text },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Palette.neutral300,
    overflow: 'hidden',
  },
  progressFill: {
    width: '62%',
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: Palette.accent2,
  },
  resume: { fontSize: 14, fontWeight: '700', color: Palette.accent700 },

  // This week
  statsRow: { flexDirection: 'row', gap: 12 },
  statTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 22,
    borderRadius: Radius.lg,
    backgroundColor: Palette.statBg,
    overflow: 'hidden',
  },
  statValue: { fontSize: 24 },
  statCaption: { fontSize: 11.5, color: Palette.neutral700 },
});

function calculateStreak(completions: ModuleCompletion[]) {
  const days = new Set(completions.map((entry) => entry.completedAt.slice(0, 10)));
  let streak = 0;
  const date = new Date();
  while (days.has(date.toISOString().slice(0, 10))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function calculateMinutes(completions: ModuleCompletion[]) {
  return completions.reduce((total, completion) => total + Number(completion.metadata?.durationMinutes ?? 2), 0);
}
