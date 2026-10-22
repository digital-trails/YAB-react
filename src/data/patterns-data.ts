// Static content for the My Patterns flow. Swap these getters for real API/DB
// calls later without touching the UI components that call them.

export type PatternCard = { id: string; title: string; description: string };
export type PatternBarItem = { label: string; value: number };
export type PatternBarCard = { id: string; title: string; items: PatternBarItem[]; callout: string };

const OTHER_PATTERN: PatternCard = { id: 'other', title: 'Something else', description: "Work on a pattern that isn't listed here" };

const PATTERN_TOPIC_BARS: PatternBarCard = {
  id: 'topics',
  title: 'What comparisons were about',
  items: [
    { label: 'Appearance', value: 8 },
    { label: 'Lifestyle', value: 5 },
    { label: 'Achievements', value: 3 },
    { label: 'Relationships', value: 2 },
  ],
  callout: '👀 Appearance comes up most for you. 68% of teens say the same.',
};

const PATTERN_PLATFORM_BARS: PatternBarCard = {
  id: 'platforms',
  title: 'Where comparisons happened',
  items: [
    { label: 'TikTok', value: 7 },
    { label: 'Instagram', value: 4 },
    { label: 'Snapchat', value: 1 },
  ],
  callout: '📱 Most of your comparisons happen on TikTok (74% of teens notice this online).',
};

const STARTER_PROMPTS: Record<string, { workOn: string[]; smallStep: string[] }> = {
  topics: {
    workOn: [
      'I want to feel less ___ when I compare my ___ to people online.',
      'I want to stop comparing my ___ to influencers I follow.',
    ],
    smallStep: [
      'Unfollow one account that makes me feel ___.',
      'Say one kind thing about my ___ today.',
    ],
  },
  platforms: {
    workOn: [
      'I want to spend less time comparing myself on ___.',
      'I want to notice how I feel after using ___ for more than ___ minutes.',
    ],
    smallStep: [
      'Set a ___ minute timer before opening the app.',
      'Turn off notifications for ___.',
    ],
  },
  other: {
    workOn: [
      'I want to work on ___.',
      'I want to feel less ___ about ___.',
    ],
    smallStep: [
      'Try ___ for just today.',
      'Take one small step: ___.',
    ],
  },
};

const DOABILITY_OPTIONS: string[] = ['Very doable', 'Pretty doable', 'A little hard', "I'm not sure"];

const REFLECTION_PROMPT = 'What would make this feel one bit easier this week?';

export function getOtherPatternOption(): PatternCard {
  return OTHER_PATTERN;
}

export function getPatternBarCards(): PatternBarCard[] {
  return [PATTERN_TOPIC_BARS, PATTERN_PLATFORM_BARS];
}

export function getStarterPrompts(patternId: string, kind: 'workOn' | 'smallStep'): string[] {
  const key = STARTER_PROMPTS[patternId] ? patternId : 'other';
  return STARTER_PROMPTS[key][kind];
}

export function getDoabilityOptions(): string[] {
  return DOABILITY_OPTIONS;
}

export function getReflectionPrompt(): string {
  return REFLECTION_PROMPT;
}
