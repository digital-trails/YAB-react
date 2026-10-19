// Typed shapes + pure builders for the You screen's streak, "Your patterns"
// charts and activity feed. Every builder takes a plain array of
// ModuleCompletion rows (already fetched by the screen) and returns data the
// chart components can render directly — no fetching happens in here, so the
// day the data moves from local SQLite to a remote API, only the fetch in
// you.tsx changes.

import { TIME_BUCKETS } from '@/constants/patterns-visuals';
import type { ModuleCompletion } from '@/data/module-history';

export const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export type Range = 7 | 30 | 'custom';
export type DateRange = { start: Date; end: Date };

export type MoodPoint = { date: string; mood: number | null };
export type ComparisonPoint = { label: string; comparison: number; mood: number };
export type TimeBucketCount = { label: string; emoji: string; color: string; value: number };
export type DomainCount = { label: string; value: number };
export type FrequencyDay = { label: string; count: number };

export function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function weekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function localDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function resolveWindow(range: Range, customRange: DateRange | null): DateRange {
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

export function currentWeekKeys() {
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - weekdayIndex(start));
  return WEEK_LABELS.map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return localDateKey(date);
  });
}

export function formatChartLabel(date: string, index: number, total: number) {
  if (total === 7) return WEEK_LABELS[index];
  // Show roughly six ticks whatever the range, so labels never overlap.
  const step = Math.max(1, Math.ceil(total / 6));
  if (index % step !== 0) return '';
  return String(Number(date.slice(8, 10)));
}

export function toNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isYes(value: unknown) {
  if (typeof value === 'boolean') return value;
  const text = String(value ?? '').trim().toLowerCase();
  return text === '1' || text === 'true' || text === 'yes' || text === 'y';
}

export function toList(value: unknown) {
  const raw = Array.isArray(value) ? value : String(value ?? '').split(/[|,]/);
  return raw.map((item) => String(item).trim()).filter(Boolean);
}

export function buildMoodPoints(window: DateRange, activity: ModuleCompletion[]): { dates: string[]; points: MoodPoint['mood'][] } {
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

export function buildComparisonPoints(activity: ModuleCompletion[]): ComparisonPoint[] {
  return WEEK_LABELS.map((label, index) => {
    const entries = activity.filter((entry) => weekdayIndex(new Date(entry.completedAt)) === index);
    const moods = entries.map((entry) => toNumber(entry.metadata?.mood)).filter((mood): mood is number => mood !== null);
    return {
      label,
      comparison: entries.filter((entry) => isYes(entry.metadata?.compared)).length,
      mood: moods.length ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length : 0,
    };
  });
}

export function buildTimeBucketCounts(activity: ModuleCompletion[]): TimeBucketCount[] {
  return TIME_BUCKETS.map((bucket) => ({
    label: bucket.label,
    emoji: bucket.emoji,
    color: bucket.color,
    value: activity.filter((entry) => {
      const hour = toNumber(entry.metadata?.hour) ?? new Date(entry.completedAt).getHours();
      // The night bucket wraps past midnight, so it needs the inverted test.
      return bucket.start < bucket.end ? hour >= bucket.start && hour < bucket.end : hour >= bucket.start || hour < bucket.end;
    }).length,
  }));
}

export function buildDomainCounts(activity: ModuleCompletion[], limit = 5): DomainCount[] {
  const counts = new Map<string, number>();
  activity.forEach((entry) => toList(entry.metadata?.domains).forEach((domain) => counts.set(domain, (counts.get(domain) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, value]) => ({ label, value }));
}

export function buildFrequencyDays(activity: ModuleCompletion[]): FrequencyDay[] {
  return WEEK_LABELS.map((label, index) => ({
    label,
    count: activity.filter((entry) => weekdayIndex(new Date(entry.completedAt)) === index && isYes(entry.metadata?.compared)).length,
  }));
}

export function calculateStreak(days: Set<string>) {
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

export function calculateLongestStreak(days: Set<string>) {
  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of [...days].sort()) {
    run = previous && isNextDayKey(previous, key) ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = key;
  }
  return longest;
}

function isNextDayKey(key: string, candidate: string) {
  const [year, month, day] = key.split('-').map(Number);
  const next = new Date(year, month - 1, day);
  next.setDate(next.getDate() + 1);
  return localDateKey(next) === candidate;
}

export function relativeDay(value: string) {
  const date = new Date(value);
  const diff = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  // Past a week the weekday name stops being unique, so fall back to the date.
  if (diff < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
