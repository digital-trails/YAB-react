// Static content for the Community + My Board screens: seed posts, reflection
// prompts, and note colors. Keeping content here (separate from the flow
// screen) mirrors wordle-data.ts / reality-quiz-data.ts. Color values are
// resolved to the app's theme tokens in community-flow.tsx — this file only
// holds the color *keys*, never hex values.

export type PromptKey = 'proud' | 'win' | 'handled' | 'kind' | 'grateful' | 'like' | 'mattered' | 'own';
export type NoteColor = 'yellow' | 'peach' | 'mint' | 'lavender' | 'sky';
export type CommCategory = 'tips' | 'notjustme' | 'reminders';

export type MyChannel = { id: string; name: string; emoji: string };

export type BoardNote = {
  id: string;
  prompt: string;
  promptKey: PromptKey;
  text: string;
  color: NoteColor;
  icon: string;
  date: string;
  channelId?: string;
};

export type CommPost = {
  id: string;
  text: string;
  color: NoteColor;
  category: CommCategory;
  timestamp: string;
};

export type CommunityState = {
  savedPostIds: string[];
  reportedPostIds: string[];
  channels: MyChannel[];
  submittedPosts: CommPost[];
};

export const PROMPTS: { key: PromptKey; label: string; emoji: string }[] = [
  { key: 'proud', label: "Something I'm proud of", emoji: '⭐' },
  { key: 'win', label: 'A small win', emoji: '🎉' },
  { key: 'handled', label: 'Something I handled well', emoji: '💪' },
  { key: 'kind', label: 'Something kind I did', emoji: '💛' },
  { key: 'grateful', label: "Something I'm grateful for", emoji: '🌱' },
  { key: 'like', label: 'Something I like about myself', emoji: '🌸' },
  { key: 'mattered', label: 'Something that mattered today', emoji: '✨' },
  { key: 'own', label: 'Write my own', emoji: '✏️' },
];

export const NOTE_ICONS = ['⭐', '🌱', '🌸', '✨', '🎉', '💛', '💪', '🌙'];

export const NOTE_COLOR_ORDER: NoteColor[] = ['yellow', 'peach', 'mint', 'lavender', 'sky'];

export const STARTERS = [
  "I'm proud that I…",
  'It took effort to…',
  'I handled ___ by…',
  'Something others may not notice is…',
];

export const BOARD_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'proud', label: 'Proud of' },
  { id: 'win', label: 'Small wins' },
  { id: 'grateful', label: 'Gratitude' },
  { id: 'like', label: 'Strengths' },
  { id: 'kind', label: 'Kindness' },
];

export const CHANNEL_EMOJIS = ['✨', '🌱', '💪', '🌸', '🎯', '💭', '🏆', '📝', '🧠', '🌙', '💛', '🎉'];

export const COMM_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'tips', label: 'Things to Try' },
  { id: 'notjustme', label: 'Not Just Me' },
  { id: 'reminders', label: 'Little Reminders' },
];

export const COMM_CATEGORIES: { id: CommCategory; label: string; emoji: string; desc: string }[] = [
  { id: 'tips', label: 'Things to Try', emoji: '💡', desc: "Share what's helped you" },
  { id: 'notjustme', label: 'Not Just Me', emoji: '🫂', desc: 'Real moments with comparison' },
  { id: 'reminders', label: 'Little Reminders', emoji: '🌙', desc: 'Something worth remembering' },
];

export const CATEGORY_LABEL: Record<CommCategory, string> = {
  tips: 'Things to Try',
  notjustme: 'Not Just Me',
  reminders: 'Little Reminder',
};

export const SEED_POSTS: CommPost[] = [
  { id: 't1', text: 'Muting people for a little bit actually helped way more than I thought.', color: 'mint', category: 'tips', timestamp: '30m ago' },
  { id: 'n1', text: "Seeing everyone post when they're hanging out without me gets to me even when I know it probably isn't that deep.", color: 'yellow', category: 'notjustme', timestamp: '1h ago' },
  { id: 'r1', text: "Someone else doing well doesn't mean you're doing badly.", color: 'sky', category: 'reminders', timestamp: '2h ago' },
  { id: 't2', text: "If I notice I'm comparing a lot, I get off the app and do something else for like 10 minutes.", color: 'yellow', category: 'tips', timestamp: '3h ago' },
  { id: 'n2', text: "Sometimes I'll post something and then keep checking who liked it which honestly makes me feel worse.", color: 'lavender', category: 'notjustme', timestamp: '4h ago' },
  { id: 'r2', text: "You're seeing one post, not their whole life.", color: 'peach', category: 'reminders', timestamp: '5h ago' },
  { id: 't3', text: "Sometimes I remind myself I'm literally only seeing what they chose to post.", color: 'lavender', category: 'tips', timestamp: '6h ago' },
  { id: 'n3', text: 'I compare myself to people I don’t even know 😭', color: 'peach', category: 'notjustme', timestamp: 'Yesterday' },
  { id: 'r3', text: 'You do not have to keep looking at something that makes you feel bad.', color: 'mint', category: 'reminders', timestamp: 'Yesterday' },
  { id: 't4', text: 'Talking to one of my friends usually gets me out of my head.', color: 'peach', category: 'tips', timestamp: 'Yesterday' },
  { id: 'n4', text: 'College/school posts stress me out way more than I want them to.', color: 'sky', category: 'notjustme', timestamp: 'Yesterday' },
  { id: 'r4', text: "It's okay to log off.", color: 'lavender', category: 'reminders', timestamp: 'Yesterday' },
];

/** Round-robin interleave posts by category so "All" never clumps by category. */
export function interleaveByCategory(posts: CommPost[]): CommPost[] {
  const buckets: Record<CommCategory, CommPost[]> = { tips: [], notjustme: [], reminders: [] };
  posts.forEach((post) => buckets[post.category].push(post));
  const order: CommCategory[] = ['tips', 'notjustme', 'reminders'];
  const result: CommPost[] = [];
  let i = 0;
  while (result.length < posts.length) {
    const bucket = buckets[order[i % 3]];
    const next = bucket.shift();
    if (next) result.push(next);
    i++;
  }
  return result;
}
