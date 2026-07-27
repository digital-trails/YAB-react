/**
 * Content and progress models.
 *
 * Everything here is SAMPLE DATA lifted from the design prototype. The handoff
 * is explicit that module names, durations and stats are illustrative, and that
 * final therapeutic copy needs clinical review before shipping.
 *
 * Screens read through `ContentRepository` rather than importing these
 * constants directly, so swapping in a real data source later is contained to
 * this file.
 */

/** Palette rotation used to give lists visual variety. Maps to token colours at render time. */
export type Tint = 'accent' | 'accent2' | 'neutral';

export type Mood = 'okay' | 'anxious' | 'overwhelmed';

export type MoodOption = {
  key: Mood;
  label: string;
  /** Contextual note revealed under the pills once this mood is selected. */
  note: string;
};

/** A short exercise for an active comparison spiral. */
export type Intervention = {
  id: string;
  title: string;
  /** Minutes; rendered as "{duration} min". */
  durationMinutes: number;
  /** Therapeutic technique, shown in the meta line. */
  technique: string;
  tint: Tint;
};

/** A longer module that builds coping skills over time. */
export type SkillModule = {
  id: string;
  title: string;
  order: number;
  totalInSeries: number;
  durationMinutes: number;
  /** 0–100. */
  progressPercent: number;
  tint: Tint;
};

export type Recommendation = {
  id: string;
  kind: 'moment' | 'skills';
  title: string;
  durationMinutes: number;
  tint: Tint;
};

export type WeeklyActivity = {
  /** Single-letter day label, Monday first. */
  label: string;
  /** 0–100, relative bar height. */
  value: number;
  /**
   * Highlights the bar in accent. The prototype hardcodes index 3; a real
   * implementation should derive this from the device date when the week's
   * data is assembled, which is why it lives on the data rather than the view.
   */
  isToday?: boolean;
};

export type ProgressSummary = {
  dayStreak: number;
  sessions: number;
  minutesPracticed: number;
  weeklyActivity: WeeklyActivity[];
  badges: string[];
};

export type AppSettings = {
  dailyReminder: boolean;
  /** Local time for the daily reminder, as displayed. */
  dailyReminderTime: string;
  pushNotifications: boolean;
  /**
   * Guardian visibility. The handoff flags that the account-linking and consent
   * flow behind this is NOT designed yet — the toggle is UI-only for now.
   */
  shareWithTrustedAdult: boolean;
};

export const MOOD_OPTIONS: MoodOption[] = [
  {
    key: 'okay',
    label: 'Okay',
    note: 'Good to hear. Keep an eye on how scrolling affects your mood today.',
  },
  {
    key: 'anxious',
    label: 'Anxious',
    note: "That's a common feeling. A quick in-the-moment reset might help right now.",
  },
  {
    key: 'overwhelmed',
    label: 'Overwhelmed',
    note: 'That sounds heavy. Consider starting with a 3-minute reset below.',
  },
];

const INTERVENTIONS: Intervention[] = [
  {
    id: 'reframe',
    title: 'Reframe a comparison thought',
    durationMinutes: 3,
    technique: 'Cognitive reframing',
    tint: 'accent',
  },
  {
    id: 'grounding',
    title: 'Grounding: 5-4-3-2-1',
    durationMinutes: 4,
    technique: 'Grounding',
    tint: 'accent2',
  },
  {
    id: 'pause',
    title: 'Pause before you scroll',
    durationMinutes: 2,
    technique: 'Urge surfing',
    tint: 'neutral',
  },
];

const SKILL_MODULES: SkillModule[] = [
  {
    id: 'understanding',
    title: 'Understanding social comparison',
    order: 1,
    totalInSeries: 4,
    durationMinutes: 12,
    progressPercent: 25,
    tint: 'accent2',
  },
  {
    id: 'self-compassion',
    title: 'Building self-compassion',
    order: 2,
    totalInSeries: 4,
    durationMinutes: 15,
    progressPercent: 0,
    tint: 'accent',
  },
  {
    id: 'boundaries',
    title: 'Setting boundaries online',
    order: 3,
    totalInSeries: 4,
    durationMinutes: 10,
    progressPercent: 0,
    tint: 'neutral',
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-reframe',
    kind: 'moment',
    title: 'Reframe a comparison thought',
    durationMinutes: 3,
    tint: 'accent',
  },
  {
    id: 'rec-self-compassion',
    kind: 'skills',
    title: 'Building self-compassion',
    durationMinutes: 15,
    tint: 'accent2',
  },
  {
    id: 'rec-grounding',
    kind: 'moment',
    title: 'Grounding: 5-4-3-2-1',
    durationMinutes: 4,
    tint: 'neutral',
  },
];

/** The module surfaced by Home's "Continue your practice" card. */
const IN_PROGRESS = { moduleId: 'naming-the-trap', title: 'Naming the comparison trap', percent: 60 };

/**
 * Home and You show different stat values in the prototype (Home is "this week",
 * You is all-time), so they are modelled separately rather than shared.
 */
const WEEKLY_STATS = { dayStreak: 4, sessions: 6, minutesPracticed: 38 };

const ALL_TIME_PROGRESS: ProgressSummary = {
  dayStreak: 4,
  sessions: 22,
  minutesPracticed: 190,
  weeklyActivity: [
    { label: 'M', value: 40 },
    { label: 'T', value: 70 },
    { label: 'W', value: 30 },
    { label: 'T', value: 90, isToday: true },
    { label: 'F', value: 55 },
    { label: 'S', value: 15 },
    { label: 'S', value: 0 },
  ],
  badges: ['7-day streak', 'First module complete', 'Early bird'],
};

/** Minutes to the design's compact form: "45m", "3h 10m", "2h". */
export function formatPracticeTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export const DEFAULT_SETTINGS: AppSettings = {
  dailyReminder: true,
  dailyReminderTime: '7:30 PM',
  pushNotifications: true,
  shareWithTrustedAdult: false,
};

/**
 * Read interface for all app content. Screens depend on this shape, not on the
 * sample constants above — the production implementation (local store plus
 * backend sync) can be dropped in without touching UI.
 */
export type ContentRepository = {
  getInterventions(): Intervention[];
  getSkillModules(): SkillModule[];
  getRecommendations(): Recommendation[];
  getInProgressModule(): typeof IN_PROGRESS | null;
  getWeeklyStats(): typeof WEEKLY_STATS;
  getProgressSummary(): ProgressSummary;
};

export const sampleContentRepository: ContentRepository = {
  getInterventions: () => INTERVENTIONS,
  getSkillModules: () => SKILL_MODULES,
  getRecommendations: () => RECOMMENDATIONS,
  getInProgressModule: () => IN_PROGRESS,
  getWeeklyStats: () => WEEKLY_STATS,
  getProgressSummary: () => ALL_TIME_PROGRESS,
};
