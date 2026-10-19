// Static content and pure scoring logic for the "My Reality" social-media
// literacy quiz. Keeping content here (separate from the flow screen) mirrors
// wordle-data.ts — swap questions or add a server-driven set later without
// touching the UI.

export type QuestionType =
  | 'multiple'
  | 'truefalse'
  | 'scenario'
  | 'numguess'
  | 'mockfeed'
  | 'mockpost'
  | 'didyouknow';

export type RealityQuestion = {
  id: number;
  type: QuestionType;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
};

export const REALITY_QUESTIONS: RealityQuestion[] = [
  {
    id: 1,
    type: 'numguess',
    question: 'How many teens say social media sometimes makes them feel pressure to look their best or come across a certain way?',
    options: ['About 1 in 5', 'About 2 in 5', 'About 4 in 5', 'Pretty much everyone'],
    correctIndex: 2,
    explanation: "About 4 in 5 teens say they feel this pressure — so if you feel it too, you're definitely not alone.",
    source: 'Common Sense Media, Center for Digital Thriving & Indiana University (2024), Unpacking Grind Culture in American Teens',
  },
  {
    id: 2,
    type: 'multiple',
    question: 'Besides looks, what else can people feel pressure about online?',
    options: ['Having a fun social life', 'Doing well or achieving things', 'Always being there for friends', 'All of these'],
    correctIndex: 3,
    explanation: 'Online pressure covers way more than appearances — your social life, achievements, and how available you seem can all feel on display.',
    source: 'Common Sense Media, Center for Digital Thriving & Indiana University (2024), Unpacking Grind Culture in American Teens',
  },
  {
    id: 3,
    type: 'mockpost',
    question: "Your friend posts pics from an amazing weekend. What's probably the most accurate way to think about it?",
    options: [
      'Their weekend was probably way better than yours',
      "If the pics are real, that's basically what their whole weekend was like",
      'The pics can be totally real and still leave out a lot',
      'People usually post the good and bad stuff pretty evenly',
    ],
    correctIndex: 2,
    explanation: "Real photos don't capture everything — the boring parts, the arguments, the bad moments rarely make the feed. A few good photos can stand in for a whole weekend without actually being the whole story.",
    source: 'Chou & Edge (2012), Cyberpsychology, Behavior, and Social Networking',
  },
  {
    id: 4,
    type: 'truefalse',
    question: "Once you know social media is filtered and curated, it shouldn't really affect how you compare yourself anymore.",
    options: ['True', 'False'],
    correctIndex: 1,
    explanation: "Knowing something intellectually doesn't stop it from affecting you emotionally. Comparison can still sting even when you're aware of how feeds work.",
    source: 'Fardouly & Holland (2018), New Media & Society',
  },
  {
    id: 5,
    type: 'multiple',
    question: 'Who do people compare themselves to online?',
    options: ['Mostly celebrities', 'Mostly influencers', 'Mostly people they know', 'It can be friends, classmates, influencers, celebrities, or basically anyone'],
    correctIndex: 3,
    explanation: 'Comparison doesn\'t have one target. Your brain can size you up against your best friend, a random influencer, or a celebrity in the same scroll.',
    source: 'Burnell et al. (2024), Journal of Youth and Adolescence',
  },
  {
    id: 6,
    type: 'mockfeed',
    question: 'Your feed suddenly feels like everyone is going to the gym. What does that actually tell you?',
    options: [
      'Most people your age are working out all the time',
      'Fitness must be getting way more popular',
      'Your friends are more active than you',
      'Not much. Your feed is partly shaped by what you click on',
    ],
    correctIndex: 3,
    explanation: 'Algorithms amplify what you engage with. A gym-heavy feed says more about your clicks than about what everyone is actually doing.',
    source: 'TikTok (2020), "How TikTok recommends videos #ForYou"',
  },
  {
    id: 7,
    type: 'scenario',
    question: 'Someone posts a selfie and gets a ton of likes. What does that tell you about how they feel about themselves?',
    options: ["They're probably really confident", 'They probably love how they look', 'They probably have high self-esteem', "You really can't tell"],
    correctIndex: 3,
    explanation: 'Posting confidently and actually feeling confident are different things. Lots of people post seeking reassurance, not because they already have it.',
    source: 'Chua & Chang (2016), Computers in Human Behavior',
  },
  {
    id: 8,
    type: 'didyouknow',
    question: 'In one study, teens and young adults cut their social media use by about half for a few weeks. What happened?',
    options: ['Nothing really changed', 'They felt more left out', 'They felt better about their appearance and weight', 'They got more anxious'],
    correctIndex: 2,
    explanation: 'Less scrolling, fewer comparisons — and people actually felt better about their bodies. The link between feed time and body image is real.',
    source: 'Thai et al. (2023), Psychology of Popular Media',
  },
  {
    id: 9,
    type: 'scenario',
    question: 'When teens compare themselves to others on social media, what kind of comparison do they make most often in everyday use?',
    options: [
      'Comparing themselves to people doing much better than them',
      'Comparing themselves to people doing much worse than them',
      'Comparing themselves to people who seem pretty similar to them',
      'Teens almost never compare themselves online',
    ],
    correctIndex: 0,
    explanation: "Most social comparison online is upward — looking at people who seem to be doing better. That's part of why scrolling can leave you feeling like you're falling behind.",
    source: 'Chua & Chang (2016), Computers in Human Behavior',
  },
  {
    id: 10,
    type: 'multiple',
    question: 'Which of these is closest to the truth about social media and mental health?',
    options: [
      'Social media is bad for everyone',
      "Social media doesn't really affect mental health",
      'More time online always means worse mental health',
      'It can help or hurt depending on what you see, what you do, and how it affects you',
    ],
    correctIndex: 3,
    explanation: "It's not black and white. How social media affects you depends on how you use it, what you see, and what headspace you're already in.",
    source: 'American Psychological Association (2023), Health Advisory on Social Media Use in Adolescence',
  },
];

export const TAKEAWAYS: { emoji: string; text: string }[] = [
  { emoji: '📖', text: 'What gets posted is only part of the story.' },
  { emoji: '🌍', text: "Your feed isn't everyone's reality." },
  { emoji: '🔁', text: "Knowing something is curated doesn't always stop comparison." },
];

export const TYPE_BADGES: Partial<Record<QuestionType, { emoji: string; label: string }>> = {
  truefalse: { emoji: '🤔', label: 'True or False' },
  didyouknow: { emoji: '💡', label: 'Did You Know?' },
  mockpost: { emoji: '📸', label: 'Real Scenario' },
  mockfeed: { emoji: '📱', label: 'Your Feed' },
  scenario: { emoji: '🤔', label: 'What Do You Think?' },
};

export function isCorrectAnswer(question: RealityQuestion, selectedIndex: number): boolean {
  return selectedIndex === question.correctIndex;
}
