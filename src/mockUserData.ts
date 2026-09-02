/**
 * Mock data for the "You" tab.
 *
 * Every export here is a stand-in for a future API call. Keep the shapes
 * (types) as the contract — when a real backend exists, replace the
 * `get...()` function bodies with fetch/query calls that resolve to the
 * same types, and nothing in you.tsx needs to change.
 */

// ---------- Profile / streak ----------

export type UserSummary = {
  name: string;
  avatarLetter: string;
  streakDays: number;
  sessions: number;
};

export type StreakData = {
  currentRun: number; // e.g. "3 Days in a Row"
  weekCompleted: boolean[]; // length 7, Mon -> Sun
  longestChain: number;
};

export function getUserSummary(): UserSummary {
  return {
    name: 'Maya',
    avatarLetter: 'M',
    streakDays: 4,
    sessions: 6,
  };
}

export function getStreakData(): StreakData {
  return {
    currentRun: 3,
    weekCompleted: [true, false, true, true, true, false, false], // Mon–Sun
    longestChain: 11,
  };
}

// ---------- Patterns carousel ----------

export type MoodPoint = {
  label: string; // day label, e.g. "Tue"
  value: number; // 1-5, matches MOOD_EMOJIS scale
};

export type MoodOverTime = {
  summary: string;
  range: '7d' | '30d';
  points: MoodPoint[];
};

export type ComparisonVsMoodPoint = {
  label: string;
  comparison: number; // 0-100
  mood: number; // 0-100
};

export type ComparisonVsMood = {
  summary: string;
  points: ComparisonVsMoodPoint[];
};

export type TimeOfDayBucket = {
  label: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  percent: number;
};

export type TimeOfDayData = {
  summary: string;
  buckets: TimeOfDayBucket[];
};

export type DomainBreakdownItem = {
  label: string;
  emoji: string;
  percent: number;
};

export type DomainBreakdownData = {
  summary: string;
  items: DomainBreakdownItem[];
};

export type WeeklyFrequencyDay = {
  label: string; // Mon..Sun
  count: number; // number of comparison moments that day
};

export type WeeklyFrequencyData = {
  summary: string;
  days: WeeklyFrequencyDay[];
  totalLabel: string;
};

export function getMoodOverTime(): MoodOverTime {
  return {
    summary: 'Your mood has been a little more positive this week.',
    range: '7d',
    points: [
      { label: 'Tue', value: 2 },
      { label: 'Wed', value: 3 },
      { label: 'Thu', value: 4 },
      { label: 'Fri', value: 5 },
      { label: 'Sat', value: 4 },
      { label: 'Sun', value: 4 },
    ],
  };
}

export function getComparisonVsMood(): ComparisonVsMood {
  return {
    summary: 'On days with more social comparison, your mood tends to be lower.',
    points: [
      { label: 'Tue', comparison: 70, mood: 30 },
      { label: 'Wed', comparison: 35, mood: 55 },
      { label: 'Thu', comparison: 55, mood: 35 },
      { label: 'Fri', comparison: 80, mood: 45 },
      { label: 'Sat', comparison: 45, mood: 60 },
      { label: 'Sun', comparison: 65, mood: 70 },
    ],
  };
}

export function getTimeOfDayData(): TimeOfDayData {
  return {
    summary: 'Most of your comparison moments happen in the evening.',
    buckets: [
      { label: 'Morning', percent: 12 },
      { label: 'Afternoon', percent: 18 },
      { label: 'Evening', percent: 45 },
      { label: 'Night', percent: 25 },
    ],
  };
}

export function getDomainBreakdown(): DomainBreakdownData {
  return {
    summary: 'Appearance has come up often lately.',
    items: [
      { label: 'Appearance', emoji: '✨', percent: 78 },
      { label: 'Fitness', emoji: '💪', percent: 54 },
      { label: 'Social Life', emoji: '👥', percent: 47 },
      { label: 'Accomplishments', emoji: '🏆', percent: 32 },
      { label: 'Style / Fashion', emoji: '👗', percent: 28 },
    ],
  };
}

export function getWeeklyFrequency(): WeeklyFrequencyData {
  return {
    summary: 'You noticed comparison on 5 days this week.',
    days: [
      { label: 'Mon', count: 1 },
      { label: 'Tue', count: 0 },
      { label: 'Wed', count: 2 },
      { label: 'Thu', count: 1 },
      { label: 'Fri', count: 3 },
      { label: 'Sat', count: 0 },
      { label: 'Sun', count: 1 },
    ],
    totalLabel: '8 comparison moments total this week',
  };
}

// ---------- Activity feed ----------

export type ActivityEntry = {
  day: string;
  activity: string;
  response: string;
  time: string;
};

export function getActivityFeed(): ActivityEntry[] {
  return [
    {
      day: 'Today',
      activity: 'My Thoughts',
      response: "I'm proud of finishing my homework today, it was difficult but I did it.",
      time: '6:00 PM',
    },
    {
      day: 'Yesterday',
      activity: 'My Values',
      response:
        'I think social media makes it harder for me to follow my value of peace because it is easy to get caught up in what everyone else is doing.',
      time: '9:00 AM',
    },
    {
      day: 'Monday',
      activity: 'My Thanks',
      response: 'Grateful for my friend Zara who always checks in on me after a rough day.',
      time: '8:30 PM',
    },
    {
      day: 'Monday',
      activity: 'Comparison Check',
      response:
        "Scrolled through Instagram for 40 mins and felt like everyone's summer looked way better than mine.",
      time: '3:15 PM',
    },
    {
      day: 'Sunday',
      activity: 'My Thoughts',
      response: 'Stayed off my phone most of the day. Felt really calm.',
      time: '4:15 PM',
    },
  ];
}