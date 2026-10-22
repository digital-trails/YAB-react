import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ActivityFeed, EmptyActivity } from '@/components/you/activity-feed';
import { PatternsCarousel } from '@/components/you/patterns-carousel';
import { StreakCard } from '@/components/you/streak-card';
import { Heading } from '@/components/ui';
import { Palette, themedStyleSheet } from '@/constants/tokens';
import { getModuleCompletions, type ModuleCompletion } from '@/data/module-history';
import { calculateLongestStreak, calculateStreak, localDateKey, resolveWindow, type DateRange, type Range } from '@/data/you-patterns';

export default function YouScreen() {
  const router = useRouter();
  const [range, setRange] = useState<Range>(7);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [activity, setActivity] = useState<ModuleCompletion[]>([]);

  // One window drives the fetch, the chart axis and the empty states so they can
  // never disagree about which days are being shown.
  const window = useMemo(() => resolveWindow(range, customRange), [customRange, range]);

  const loadActivity = useCallback(async () => {
    try {
      const entries = await getModuleCompletions(new Date(window.start));
      setActivity(entries.filter((entry) => new Date(entry.completedAt) <= window.end));
    } catch {
      setActivity([]);
    }
  }, [window]);

  useFocusEffect(useCallback(() => {
    void loadActivity();
  }, [loadActivity]));

  const days = useMemo(() => new Set(activity.map((entry) => localDateKey(new Date(entry.completedAt)))), [activity]);
  const streak = calculateStreak(days);
  const longestStreak = calculateLongestStreak(days);
  const chooseRange = (nextRange: Range) => {
    setRange(nextRange);
    if (nextRange !== 'custom') setCustomRange(null);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}><Heading style={styles.avatarLetter}>M</Heading></View>
        <View style={styles.headerCopy}><Heading style={styles.name}>Maya</Heading><Text style={styles.summary}>{streak} day streak · {activity.length} {activity.length === 1 ? 'session' : 'sessions'}</Text></View>
        <Pressable accessibilityLabel="Settings" onPress={() => router.push('/settings')} hitSlop={10} style={styles.settingsButton}><Ionicons name="settings-outline" size={22} color={Palette.neutral700} /></Pressable>
      </View>
      <View style={styles.divider} />
      <StreakCard activityDays={days} currentRun={streak} longestRun={longestStreak} />
      <PatternsCarousel range={range} window={window} customRange={customRange} onRangeChange={chooseRange} onCustomRangeChange={setCustomRange} activity={activity} />
      <View style={styles.divider} />
      <View style={styles.activitySection}>
        <Heading style={styles.activityTitle}>Your activity</Heading>
        {activity.length ? <ActivityFeed activity={activity} /> : <EmptyActivity range={range} />}
      </View>
    </ScrollView>
  );
}

const styles = themedStyleSheet(() => ({
  scroll: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, paddingTop: 14, paddingBottom: 40, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  headerCopy: { flex: 1, alignItems: 'center', gap: 5 },
  settingsButton: { padding: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Palette.accent2_200, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 25, color: Palette.accent2_700 },
  name: { fontSize: 23, color: Palette.text },
  summary: { color: Palette.neutral700, fontSize: 13 },
  divider: { height: 1, backgroundColor: Palette.neutral300 },
  activitySection: { gap: 16 },
  activityTitle: { fontSize: 23, color: Palette.text },
}));
