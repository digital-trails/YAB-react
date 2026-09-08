import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Btn, Heading } from '@/components/ui';
import { getModuleCompletions, type ModuleCompletion } from '@/data/module-history';
import { Palette, Radius, Shadow } from '@/constants/tokens';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];

type Range = 7 | 30 | 'custom';

type DateRange = { start: Date; end: Date };

export default function YouScreen() {
  const [range, setRange] = useState<Range>(7);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [activity, setActivity] = useState<ModuleCompletion[]>([]);

  const loadActivity = useCallback(async () => {
    try {
      const since = customRange?.start ?? new Date();
      if (!customRange) since.setDate(since.getDate() - (range === 'custom' ? 7 : range));
      setActivity(await getModuleCompletions(since));
    } catch {
      setActivity([]);
    }
  }, [customRange, range]);

  useFocusEffect(useCallback(() => {
    void loadActivity();
  }, [loadActivity]));

  const days = new Set(activity.map((entry) => entry.completedAt.slice(0, 10)));
  const streak = calculateStreak(days);
  const chooseRange = (nextRange: Range) => {
    setRange(nextRange);
    if (nextRange !== 'custom') setCustomRange(null);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}><Heading style={styles.avatarLetter}>M</Heading></View>
        <Heading style={styles.name}>Maya</Heading>
        <Text style={styles.summary}>{streak} day streak · {activity.length} {activity.length === 1 ? 'session' : 'sessions'}</Text>
      </View>
      <View style={styles.divider} />
      <StreakCard activityDays={days} currentRun={streak} />
      <Patterns range={range} customRange={customRange} onRangeChange={chooseRange} onCustomRangeChange={setCustomRange} activity={activity} />
      <View style={styles.activitySection}>
        <Heading style={styles.activityTitle}>Your activity</Heading>
        {activity.length ? <ActivityFeed activity={activity} /> : <EmptyActivity range={range} />}
      </View>
    </ScrollView>
  );
}

function StreakCard({ activityDays, currentRun }: { activityDays: Set<string>; currentRun: number }) {
  const today = new Date();
  const week = WEEK_LABELS.map((_, index) => {
    const date = new Date(today);
    const day = today.getDay() || 7;
    date.setDate(today.getDate() - day + index + 1);
    return date.toISOString().slice(0, 10);
  });

  return <View style={styles.card}>
    <Heading style={styles.cardTitle}>{currentRun ? `🔥 ${currentRun} Days in a Row` : 'Ready to start a streak?'}</Heading>
    <Text style={styles.cardSubtitle}>{currentRun ? 'Keep it up — you&apos;re on a roll!' : 'Complete a module today to begin.'}</Text>
    <View style={styles.weekRow}>{week.map((date, index) => <View key={date} style={styles.weekDayCol}>
      <View style={[styles.weekDot, activityDays.has(date) ? styles.weekDotDone : styles.weekDotEmpty]}>{activityDays.has(date) ? <Text style={styles.weekCheck}>✓</Text> : null}</View>
      <Text style={styles.weekLabel}>{WEEK_LABELS[index]}</Text>
    </View>)}</View>
  </View>;
}

function Patterns({ range, customRange, onRangeChange, onCustomRangeChange, activity }: { range: Range; customRange: DateRange | null; onRangeChange: (range: Range) => void; onCustomRangeChange: (range: DateRange | null) => void; activity: ModuleCompletion[] }) {
  const { dates, points } = useMemo(() => buildMoodPoints(range, customRange, activity), [activity, customRange, range]);
  return <View style={styles.patternsSection}>
    <View style={styles.sectionHeading}><Heading style={styles.patternsTitle}>Your patterns</Heading><View style={styles.rangeToggle}>{([7, 30, 'custom'] as Range[]).map((option) => <Pressable key={option} onPress={() => onRangeChange(option)} style={[styles.rangeOption, range === option && styles.rangeActive]}><Text style={range === option ? styles.rangeActiveText : styles.rangeText}>{option === 'custom' ? 'Calendar' : `${option}d`}</Text></Pressable>)}</View></View>
    {range === 'custom' ? <CustomRangePicker value={customRange} onChange={onCustomRangeChange} /> : null}
    <View style={styles.card}>
      <Heading style={styles.cardTitle}>How You&apos;ve Been Feeling</Heading>
      <Text style={styles.cardSubtitle}>Your mood has been a little more positive this week.</Text>
      <View style={styles.chart}>{points.map((point, index) => <View key={dates[index]} style={styles.chartColumn}><Text style={styles.mood}>{point ? MOOD_EMOJIS[point - 1] : ''}</Text><View style={styles.chartTrack}>{point ? <View style={[styles.chartFill, { height: `${point * 20}%` }]} /> : null}</View><Text style={styles.axisLabel}>{formatChartLabel(dates[index], range, index)}</Text></View>)}</View>
      {points.every((point) => point === null) ? <Text style={styles.noData}>No mood check-ins in this range yet.</Text> : null}
    </View>
  </View>;
}

function buildMoodPoints(range: Range, customRange: DateRange | null, activity: ModuleCompletion[]) {
  const end = customRange?.end ?? new Date();
  const start = customRange?.start ?? new Date(end);
  if (!customRange) start.setDate(end.getDate() - (range === 30 ? 29 : 6));
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  const byDate = new Map(activity.filter((entry) => entry.metadata?.mood).map((entry) => [entry.completedAt.slice(0, 10), Number(entry.metadata?.mood)]));
  return { dates, points: dates.map((date) => byDate.get(date) ?? null) };
}

function formatChartLabel(date: string, range: Range, index: number) {
  if (range === 7) return WEEK_LABELS[index];
  if (range === 'custom' && index % Math.max(1, Math.ceil(index / 6)) === 0) return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return index % 7 === 0 ? `W${Math.floor(index / 7) + 1}` : '';
}

function CustomRangePicker({ value, onChange }: { value: DateRange | null; onChange: (range: DateRange) => void }) {
  const [startText, setStartText] = useState(value ? formatDateInput(value.start) : '');
  const [endText, setEndText] = useState(value ? formatDateInput(value.end) : '');
  const apply = () => {
    const start = new Date(`${startText}T00:00:00`);
    const end = new Date(`${endText}T23:59:59`);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start <= end) onChange({ start, end });
  };
  return <View style={styles.customPicker}><Text style={styles.customHint}>Choose dates (YYYY-MM-DD)</Text><View style={styles.dateInputs}><TextInput value={startText} onChangeText={setStartText} placeholder="Start date" placeholderTextColor={Palette.neutral600} style={styles.dateInput} /><TextInput value={endText} onChangeText={setEndText} placeholder="End date" placeholderTextColor={Palette.neutral600} style={styles.dateInput} /></View><Btn label="Apply dates" variant="ghost" onPress={apply} /></View>;
}

function formatDateInput(date: Date) { return date.toISOString().slice(0, 10); }

function ActivityFeed({ activity }: { activity: ModuleCompletion[] }) {
  const groups = activity.reduce<Record<string, ModuleCompletion[]>>((result, entry) => {
    const group = relativeDay(entry.completedAt);
    (result[group] ??= []).push(entry);
    return result;
  }, {});
  return <>{Object.entries(groups).map(([group, entries]) => <View key={group} style={styles.entryGroup}><Text style={styles.day}>{group}</Text>{entries.map((entry) => <View key={entry.id} style={styles.entry}><Heading style={styles.entryTitle}>{entry.title}</Heading>{entry.body ? <Text style={styles.response}>{entry.body}</Text> : null}<Text style={styles.time}>{formatTime(entry.completedAt)}</Text></View>)}</View>)}</>;
}

function EmptyActivity({ range }: { range: Range }) {
  return <View style={styles.empty}><Text style={styles.emptyIcon}>✦</Text><Heading style={styles.emptyTitle}>Nothing here yet</Heading><Text style={styles.emptyBody}>Finish a Library activity and it will show up in your past {range === 7 ? 'week' : '30 days'}.</Text></View>;
}

function relativeDay(value: string) {
  const date = new Date(value);
  const today = new Date();
  const diff = Math.floor((new Date(today.toDateString()).getTime() - new Date(date.toDateString()).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function calculateStreak(days: Set<string>) {
  let streak = 0;
  const date = new Date();
  while (days.has(date.toISOString().slice(0, 10))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, paddingTop: 14, paddingBottom: 40, gap: 20 },
  header: { alignItems: 'center', gap: 5, paddingTop: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Palette.accent2_200, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 25, color: Palette.accent2_700 },
  name: { fontSize: 23, color: Palette.text },
  summary: { color: Palette.neutral700, fontSize: 13 },
  divider: { height: 1, backgroundColor: Palette.neutral300 },
  card: { gap: 12, padding: 18, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, boxShadow: Shadow.elevSm },
  cardTitle: { fontSize: 19, color: Palette.text },
  cardSubtitle: { fontSize: 13.5, color: Palette.neutral700, lineHeight: 19 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  weekDayCol: { alignItems: 'center', gap: 6 },
  weekDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  weekDotDone: { backgroundColor: Palette.accent2_700 },
  weekDotEmpty: { backgroundColor: Palette.neutral300 },
  weekCheck: { color: Palette.bg, fontWeight: '800' },
  weekLabel: { color: Palette.neutral700, fontSize: 11, fontWeight: '700' },
  patternsSection: { gap: 12 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  patternsTitle: { fontSize: 23, color: Palette.text },
  rangeToggle: { flexDirection: 'row', backgroundColor: Palette.neutral200, borderRadius: Radius.pill, overflow: 'hidden' },
  rangeOption: { fontSize: 12, fontWeight: '700', paddingVertical: 7, paddingHorizontal: 11 },
  rangeText: { color: Palette.neutral700 },
  rangeActive: { backgroundColor: Palette.text, borderRadius: Radius.pill },
  rangeActiveText: { color: Palette.bg },
  customPicker: { gap: 8, padding: 12, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300 },
  customHint: { color: Palette.neutral700, fontSize: 12 },
  dateInputs: { flexDirection: 'row', gap: 8 },
  dateInput: { flex: 1, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.sm, padding: 10, color: Palette.text, backgroundColor: Palette.bg, fontSize: 12 },
  noData: { color: Palette.neutral700, fontSize: 12, textAlign: 'center' },
  chart: { height: 145, flexDirection: 'row', alignItems: 'flex-end', gap: 5 },
  chartColumn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  mood: { height: 20, fontSize: 13 },
  chartTrack: { flex: 1, width: '100%', maxWidth: 18, justifyContent: 'flex-end', backgroundColor: Palette.neutral200, borderRadius: Radius.pill, overflow: 'hidden' },
  chartFill: { width: '100%', backgroundColor: Palette.accent2_700, borderRadius: Radius.pill },
  axisLabel: { color: Palette.neutral700, fontSize: 10, height: 14 },
  activitySection: { gap: 16 },
  activityTitle: { fontSize: 23, color: Palette.text },
  entryGroup: { gap: 7 },
  day: { fontSize: 12, fontWeight: '700', color: Palette.neutral700, textTransform: 'uppercase', letterSpacing: 0.8 },
  entry: { gap: 7, padding: 14, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, boxShadow: Shadow.elevSm },
  entryTitle: { fontSize: 18, color: Palette.text },
  response: { fontSize: 14, lineHeight: 21, color: Palette.text },
  time: { fontSize: 11, color: Palette.neutral700 },
  empty: { alignItems: 'center', gap: 8, padding: 24, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300 },
  emptyIcon: { color: Palette.accent2_700, fontSize: 26 },
  emptyTitle: { fontSize: 18, color: Palette.text },
  emptyBody: { color: Palette.neutral700, fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
