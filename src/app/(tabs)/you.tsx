import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

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
      <Patterns range={range} window={window} customRange={customRange} onRangeChange={chooseRange} onCustomRangeChange={setCustomRange} activity={activity} />
      <View style={styles.activitySection}>
        <Heading style={styles.activityTitle}>Your activity</Heading>
        {activity.length ? <ActivityFeed activity={activity} /> : <EmptyActivity range={range} />}
      </View>
    </ScrollView>
  );
}

function StreakCard({ activityDays, currentRun }: { activityDays: Set<string>; currentRun: number }) {
  const todayKey = localDateKey(new Date());
  const week = currentWeekKeys();

  return <View style={styles.card}>
    <Heading style={styles.cardTitle}>{currentRun ? `🔥 ${currentRun} ${currentRun === 1 ? 'Day' : 'Days'} in a Row` : 'Ready to start a streak?'}</Heading>
    <Text style={styles.cardSubtitle}>{currentRun ? "Keep it up — you're on a roll!" : 'Complete a module today to begin.'}</Text>
    <View style={styles.weekRow}>{week.map((date, index) => {
      const done = activityDays.has(date);
      return <View key={date} style={styles.weekDayCol}>
        <View style={[styles.weekDot, done ? styles.weekDotDone : styles.weekDotEmpty, date === todayKey && styles.weekDotToday]}>
          {done ? <Text style={styles.weekCheck}>✓</Text> : null}
        </View>
        <Text style={[styles.weekLabel, date === todayKey && styles.weekLabelToday]}>{WEEK_LABELS[index]}</Text>
      </View>;
    })}</View>
  </View>;
}

function Patterns({ range, window, customRange, onRangeChange, onCustomRangeChange, activity }: { range: Range; window: DateRange; customRange: DateRange | null; onRangeChange: (range: Range) => void; onCustomRangeChange: (range: DateRange | null) => void; activity: ModuleCompletion[] }) {
  const { dates, points } = useMemo(() => buildMoodPoints(window, activity), [activity, window]);
  const { width: screenWidth } = useWindowDimensions();
  const [page, setPage] = useState(0);
  // The carousel is full-bleed (negative margins), so its own width — not the
  // padded parent's — is the paging interval.
  const [pageWidth, setPageWidth] = useState(screenWidth);
  const carouselRef = useRef<ScrollView>(null);
  // Pattern cards read metadata rather than a module id, so any check-in that
  // recorded the fields shows up here.
  const checkIns = activity.filter((entry) => entry.metadata != null);
  const cards = [
    <MoodCard key="mood" dates={dates} points={points} range={range} onRangeChange={onRangeChange} customRange={customRange} onCustomRangeChange={onCustomRangeChange} />,
    <ComparisonCard key="comparison" activity={checkIns} />,
    <TimeCard key="time" activity={checkIns} />,
    <DomainCard key="domain" activity={checkIns} />,
    <FrequencyCard key="frequency" activity={checkIns} />,
  ];
  const goToPage = (nextPage: number) => {
    const boundedPage = Math.max(0, Math.min(cards.length - 1, nextPage));
    setPage(boundedPage);
    carouselRef.current?.scrollTo({ x: boundedPage * pageWidth, animated: true });
  };

  return <View style={styles.patternsSection}>
    <Heading style={styles.patternsTitle}>Your patterns</Heading>
    <ScrollView
      ref={carouselRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
      onScroll={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / pageWidth))}
      style={styles.carousel}
    >
      {cards.map((card, index) => <View key={index} style={[styles.carouselPage, { width: pageWidth }]}>{card}</View>)}
    </ScrollView>
    <View style={styles.carouselControls}>
      <Pressable onPress={() => goToPage(page - 1)} disabled={page === 0} hitSlop={10} style={styles.carouselArrow}><Text style={page === 0 ? styles.disabledArrow : styles.arrow}>‹</Text></Pressable>
      <View style={styles.dots}>{cards.map((_, index) => <Pressable key={index} onPress={() => goToPage(index)} hitSlop={8} style={[styles.dot, index === page && styles.activeDot]} />)}</View>
      <Pressable onPress={() => goToPage(page + 1)} disabled={page === cards.length - 1} hitSlop={10} style={styles.carouselArrow}><Text style={page === cards.length - 1 ? styles.disabledArrow : styles.arrow}>›</Text></Pressable>
    </View>
  </View>;
}

function PatternCard({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return <View style={styles.card}><Heading style={styles.cardTitle}>{title}</Heading><Text style={styles.cardSubtitle}>{summary}</Text>{children}</View>;
}

function MoodCard({ dates, points, range, onRangeChange, customRange, onCustomRangeChange }: { dates: string[]; points: (number | null)[]; range: Range; onRangeChange: (range: Range) => void; customRange: DateRange | null; onCustomRangeChange: (range: DateRange | null) => void }) {
  // Thirty columns cannot carry an emoji and a fat bar, so the chart thins out
  // as the range grows instead of collapsing to slivers.
  const dense = dates.length > 10;
  const gap = dense ? 2 : 5;
  const filled = points.filter((point) => point !== null).length;

  return <PatternCard title="How You've Been Feeling" summary="Your mood check-ins over time.">
    <View style={styles.rangeToggle}>
      {([7, 30, 'custom'] as Range[]).map((option) => <Pressable key={option} onPress={() => onRangeChange(option)} style={[styles.rangeOption, range === option && styles.rangeActive]}>
        <Text style={range === option ? styles.rangeActiveText : styles.rangeText}>{option === 'custom' ? 'Dates' : `${option} days`}</Text>
      </Pressable>)}
    </View>
    {range === 'custom' ? <CustomRangePicker value={customRange} onChange={onCustomRangeChange} /> : null}
    <View style={[styles.chart, { gap }]}>
      {points.map((point, index) => <View key={dates[index]} style={styles.chartColumn}>
        {dense ? null : <Text style={styles.mood}>{point ? MOOD_EMOJIS[point - 1] : ''}</Text>}
        <View style={[styles.chartTrack, dense && styles.chartTrackDense]}>
          {point ? <View style={[styles.chartFill, { height: `${point * 20}%` }]} /> : null}
        </View>
        <Text style={styles.axisLabel} numberOfLines={1}>{formatChartLabel(dates[index], index, dates.length)}</Text>
      </View>)}
    </View>
    {filled ? null : <Text style={styles.noData}>No mood check-ins in this range yet. Complete the mood question in Tune In to see your check-ins here.</Text>}
  </PatternCard>;
}

function ComparisonCard({ activity }: { activity: ModuleCompletion[] }) {
  const points = WEEK_LABELS.map((_, index) => {
    const entries = activity.filter((entry) => weekdayIndex(new Date(entry.completedAt)) === index);
    const moods = entries.map((entry) => toNumber(entry.metadata?.mood)).filter((mood): mood is number => mood !== null);
    return {
      label: WEEK_LABELS[index],
      comparison: entries.filter((entry) => isYes(entry.metadata?.compared)).length,
      mood: moods.length ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length : 0,
    };
  });
  const peak = Math.max(...points.map((point) => point.comparison), 1);
  const hasData = points.some((point) => point.comparison || point.mood);

  return <PatternCard title="A Pattern We Noticed" summary={hasData ? 'Comparison and mood from your check-ins.' : 'Complete Tune In check-ins to compare these patterns.'}>
    <View style={styles.dualChart}>{points.map((point, index) => <View key={index} style={styles.dualColumn}>
      <View style={styles.dualTrack}>
        <View style={[styles.comparisonBar, { height: `${(point.comparison / peak) * 100}%` }]} />
        <View style={[styles.moodBar, { height: `${(point.mood / 5) * 100}%` }]} />
      </View>
      <Text style={styles.axisLabel}>{point.label}</Text>
    </View>)}</View>
    <View style={styles.legendRow}>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: Palette.accent700 }]} /><Text style={styles.legendText}>Comparison</Text></View>
      <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: Palette.accent2_700 }]} /><Text style={styles.legendText}>Mood</Text></View>
    </View>
  </PatternCard>;
}

const TIME_BUCKETS = [
  { label: 'Morning', emoji: '🌅', start: 5, end: 12 },
  { label: 'Afternoon', emoji: '☀️', start: 12, end: 17 },
  { label: 'Evening', emoji: '🌆', start: 17, end: 21 },
  { label: 'Night', emoji: '🌙', start: 21, end: 5 },
];

function TimeCard({ activity }: { activity: ModuleCompletion[] }) {
  const items = TIME_BUCKETS.map((bucket) => ({
    label: `${bucket.emoji} ${bucket.label}`,
    value: activity.filter((entry) => {
      const hour = toNumber(entry.metadata?.hour) ?? new Date(entry.completedAt).getHours();
      // The night bucket wraps past midnight, so it needs the inverted test.
      return bucket.start < bucket.end ? hour >= bucket.start && hour < bucket.end : hour >= bucket.start || hour < bucket.end;
    }).length,
  }));
  return <PatternCard title="When Comparison Shows Up" summary="When you complete Tune In, your check-in time appears here.">
    <BarRows items={items} empty="No timing data yet." />
  </PatternCard>;
}

function DomainCard({ activity }: { activity: ModuleCompletion[] }) {
  const counts = new Map<string, number>();
  activity.forEach((entry) => toList(entry.metadata?.domains).forEach((domain) => counts.set(domain, (counts.get(domain) ?? 0) + 1)));
  const items = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value }));
  return <PatternCard title="What Comparison Is About" summary={items.length ? 'Topics from your recent comparison check-ins.' : 'Choose a comparison topic in Tune In to see it here.'}>
    <BarRows items={items} empty="No topic data yet." />
  </PatternCard>;
}

function FrequencyCard({ activity }: { activity: ModuleCompletion[] }) {
  const counts = WEEK_LABELS.map((_, index) => activity.filter((entry) => weekdayIndex(new Date(entry.completedAt)) === index && isYes(entry.metadata?.compared)).length);
  const activeDays = counts.filter(Boolean).length;
  return <PatternCard title="Comparison This Week" summary={activeDays ? `You noticed comparison on ${activeDays} ${activeDays === 1 ? 'day' : 'days'} this week.` : 'Complete Tune In check-ins to track comparison frequency.'}>
    <View style={styles.frequencyRow}>{counts.map((count, index) => <View key={index} style={styles.frequencyColumn}>
      <View style={styles.frequencyDots}>{count ? Array.from({ length: Math.min(count, 4) }, (_, dot) => <View key={dot} style={styles.frequencyDot} />) : <View style={styles.frequencyEmpty} />}</View>
      <Text style={styles.axisLabel}>{WEEK_LABELS[index]}</Text>
    </View>)}</View>
  </PatternCard>;
}

function BarRows({ items, empty }: { items: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (!items.length || !items.some((item) => item.value)) return <Text style={styles.noData}>{empty}</Text>;
  return <View style={styles.barRows}>{items.map((item) => <View key={item.label} style={styles.barRow}>
    <View style={styles.barLabel}><Text style={styles.barText}>{item.label}</Text><Text style={styles.barValue}>{item.value}</Text></View>
    <View style={styles.barTrack}><View style={[styles.barFill, { width: `${(item.value / max) * 100}%` }]} /></View>
  </View>)}</View>;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function resolveWindow(range: Range, customRange: DateRange | null): DateRange {
  if (customRange) return { start: startOfDay(customRange.start), end: endOfDay(customRange.end) };
  if (range === 30) {
    const start = startOfDay(new Date());
    start.setDate(start.getDate() - 29);
    return { start, end: endOfDay(new Date()) };
  }
  // The short chart is the current calendar week (Monday–Sunday), not a rolling
  // seven days, so today's check-in always lands under today's label.
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - weekdayIndex(start));
  const end = startOfDay(start);
  end.setDate(start.getDate() + 6);
  return { start, end: endOfDay(end) };
}

function currentWeekKeys() {
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - weekdayIndex(start));
  return WEEK_LABELS.map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return localDateKey(date);
  });
}

function buildMoodPoints(window: DateRange, activity: ModuleCompletion[]) {
  const dates: string[] = [];
  const cursor = startOfDay(window.start);
  const last = startOfDay(window.end);
  while (cursor <= last) {
    dates.push(localDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Several check-ins can land on one day; average them instead of letting the
  // last one silently win.
  const byDate = new Map<string, number[]>();
  activity.forEach((entry) => {
    const mood = toNumber(entry.metadata?.mood);
    if (mood === null || mood < 1 || mood > 5) return;
    const key = localDateKey(new Date(entry.completedAt));
    (byDate.get(key) ?? byDate.set(key, []).get(key)!).push(mood);
  });

  return {
    dates,
    points: dates.map((date) => {
      const moods = byDate.get(date);
      return moods?.length ? Math.round(moods.reduce((sum, mood) => sum + mood, 0) / moods.length) : null;
    }),
  };
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isYes(value: unknown) {
  if (typeof value === 'boolean') return value;
  const text = String(value ?? '').trim().toLowerCase();
  return text === '1' || text === 'true' || text === 'yes' || text === 'y';
}

function toList(value: unknown) {
  const raw = Array.isArray(value) ? value : String(value ?? '').split(/[|,]/);
  return raw.map((item) => String(item).trim()).filter(Boolean);
}

function weekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function localDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatChartLabel(date: string, index: number, total: number) {
  if (total === 7) return WEEK_LABELS[index];
  // Show roughly six ticks whatever the range, so labels never overlap.
  const step = Math.max(1, Math.ceil(total / 6));
  if (index % step !== 0) return '';
  return String(Number(date.slice(8, 10)));
}

function CustomRangePicker({ value, onChange }: { value: DateRange | null; onChange: (range: DateRange) => void }) {
  const [startText, setStartText] = useState(value ? formatDateInput(value.start) : '');
  const [endText, setEndText] = useState(value ? formatDateInput(value.end) : '');
  const [error, setError] = useState('');
  const apply = () => {
    const start = new Date(`${startText}T00:00:00`);
    const end = new Date(`${endText}T23:59:59`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return setError('Use YYYY-MM-DD for both dates.');
    if (start > end) return setError('The start date must come before the end date.');
    setError('');
    onChange({ start, end });
  };
  return <View style={styles.customPicker}>
    <Text style={styles.customHint}>Choose dates (YYYY-MM-DD)</Text>
    <View style={styles.dateInputs}>
      <TextInput value={startText} onChangeText={setStartText} placeholder="Start date" placeholderTextColor={Palette.neutral600} style={styles.dateInput} />
      <TextInput value={endText} onChangeText={setEndText} placeholder="End date" placeholderTextColor={Palette.neutral600} style={styles.dateInput} />
    </View>
    {error ? <Text style={styles.customError}>{error}</Text> : null}
    <Btn label="Apply dates" variant="ghost" onPress={apply} />
  </View>;
}

function formatDateInput(date: Date) { return localDateKey(date); }

function ActivityFeed({ activity }: { activity: ModuleCompletion[] }) {
  const groups = [...activity]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .reduce<Record<string, ModuleCompletion[]>>((result, entry) => {
      const group = relativeDay(entry.completedAt);
      (result[group] ??= []).push(entry);
      return result;
    }, {});
  return <>{Object.entries(groups).map(([group, entries]) => <View key={group} style={styles.entryGroup}>
    <Text style={styles.day}>{group}</Text>
    {entries.map((entry) => <View key={entry.id} style={styles.entry}>
      <Heading style={styles.entryTitle}>{entry.title}</Heading>
      {entry.body ? <Text style={styles.response}>{entry.body}</Text> : null}
      <Text style={styles.time}>{formatTime(entry.completedAt)}</Text>
    </View>)}
  </View>)}</>;
}

function EmptyActivity({ range }: { range: Range }) {
  const label = range === 7 ? 'week' : range === 30 ? '30 days' : 'selected dates';
  return <View style={styles.empty}><Text style={styles.emptyIcon}>✦</Text><Heading style={styles.emptyTitle}>Nothing here yet</Heading><Text style={styles.emptyBody}>Finish a Library activity and it will show up in your past {label}.</Text></View>;
}

function relativeDay(value: string) {
  const date = new Date(value);
  const diff = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  // Past a week the weekday name stops being unique, so fall back to the date.
  if (diff < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function calculateStreak(days: Set<string>) {
  const date = new Date();
  // A streak only breaks after a full missed day, so an empty today still counts
  // yesterday's run.
  if (!days.has(localDateKey(date))) date.setDate(date.getDate() - 1);
  let streak = 0;
  while (days.has(localDateKey(date))) {
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
  weekDotToday: { borderWidth: 2, borderColor: Palette.text },
  weekCheck: { color: Palette.bg, fontWeight: '800' },
  weekLabel: { color: Palette.neutral700, fontSize: 11, fontWeight: '700' },
  weekLabelToday: { color: Palette.text },
  patternsSection: { gap: 12 },
  patternsTitle: { fontSize: 23, color: Palette.text },
  carousel: { marginHorizontal: -20 },
  carouselPage: { paddingHorizontal: 20 },
  carouselControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  carouselArrow: { minWidth: 28, alignItems: 'center' },
  arrow: { color: Palette.text, fontSize: 28, lineHeight: 28 },
  disabledArrow: { color: Palette.neutral300, fontSize: 28, lineHeight: 28 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Palette.neutral300 },
  activeDot: { width: 18, backgroundColor: Palette.text },
  rangeToggle: { flexDirection: 'row', alignSelf: 'stretch', backgroundColor: Palette.neutral200, borderRadius: Radius.pill, overflow: 'hidden' },
  rangeOption: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 6 },
  rangeText: { color: Palette.neutral700, fontSize: 12, fontWeight: '700' },
  rangeActive: { backgroundColor: Palette.text, borderRadius: Radius.pill },
  rangeActiveText: { color: Palette.bg, fontSize: 12, fontWeight: '700' },
  customPicker: { gap: 8, padding: 12, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300 },
  customHint: { color: Palette.neutral700, fontSize: 12 },
  customError: { color: Palette.accent700, fontSize: 12 },
  dateInputs: { flexDirection: 'row', gap: 8 },
  dateInput: { flex: 1, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.sm, padding: 10, color: Palette.text, backgroundColor: Palette.bg, fontSize: 12 },
  noData: { color: Palette.neutral700, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  dualChart: { height: 130, flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  dualColumn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  dualTrack: { flex: 1, width: '100%', maxWidth: 26, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3 },
  comparisonBar: { flex: 1, minHeight: 3, backgroundColor: Palette.accent700, borderTopLeftRadius: Radius.pill, borderTopRightRadius: Radius.pill },
  moodBar: { flex: 1, minHeight: 3, backgroundColor: Palette.accent2_700, borderTopLeftRadius: Radius.pill, borderTopRightRadius: Radius.pill },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Palette.neutral700, fontSize: 12 },
  barRows: { gap: 12 },
  barRow: { gap: 5 },
  barLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  barText: { color: Palette.text, fontSize: 12 },
  barValue: { color: Palette.neutral700, fontSize: 12 },
  barTrack: { height: 8, borderRadius: Radius.pill, backgroundColor: Palette.neutral200, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Palette.accent2_700 },
  frequencyRow: { flexDirection: 'row', justifyContent: 'space-between', height: 100 },
  frequencyColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  frequencyDots: { height: 72, justifyContent: 'flex-end', gap: 5 },
  frequencyDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Palette.accent700 },
  frequencyEmpty: { width: 12, height: 12, borderRadius: 6, backgroundColor: Palette.neutral300 },
  chart: { height: 145, flexDirection: 'row', alignItems: 'flex-end' },
  chartColumn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  mood: { height: 22, lineHeight: 20, fontSize: 14 },
  chartTrack: { flex: 1, width: '100%', maxWidth: 18, justifyContent: 'flex-end', backgroundColor: Palette.neutral200, borderRadius: Radius.pill, overflow: 'hidden' },
  chartTrackDense: { maxWidth: 8 },
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
