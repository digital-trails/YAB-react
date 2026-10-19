// Static content for the My Values flow: per-value placeholder copy and
// example toward/away moves, plus the small option lists used in the Plan and
// Review steps. Mirrors patterns-data.ts's role for the Patterns flow.

export const VALUE_PLACEHOLDERS: Record<string, string> = {
  Connection: 'For example: friendships, family, feeling like I belong…',
  'Being Yourself': 'For example: self-expression, confidence, staying true to myself…',
  Growth: 'For example: learning, improving, trying new things…',
  Achievement: 'For example: school, sports, personal goals…',
  'Health & Well-Being': 'For example: mental health, sleep, taking care of your body…',
  Creativity: 'For example: art, music, writing, making things…',
  Independence: 'For example: making my own choices, responsibility, doing things for yourself…',
  Kindness: 'For example: caring for myself, helping friends, supporting others…',
  Fun: 'For example: hobbies, spending time with friends, relaxing, trying something new…',
  'Something Else': 'What matters to you here?',
};

export const TOWARD_EXAMPLES: Record<string, string[]> = {
  Connection: ['Reach out to a friend', 'Make plans with someone', 'Ask how someone is really doing', 'Spend time with people who get me'],
  'Being Yourself': ['Wear what feels like me', 'Share an honest opinion', 'Try something I actually like', "Say no to things that don't fit me"],
  Growth: ['Try something new this week', 'Practice a skill I want to improve', 'Ask for feedback', 'Read or learn something'],
  Achievement: ['Work on a goal a little at a time', 'Finish something I started', 'Celebrate a small win', 'Ask for help when stuck'],
  'Health & Well-Being': ['Do movement I enjoy', 'Eat something that gives me energy', 'Rest when my body needs it', 'Spend less time with content that makes me criticize myself'],
  Creativity: ['Make something just for fun', 'Try a new creative medium', 'Share something I made', 'Give myself permission to make something "bad"'],
  Independence: ['Make a decision on my own', 'Try handling something myself first', 'Speak up for what I want', 'Take responsibility for a task'],
  Kindness: ['Check in on a friend', 'Say something encouraging', 'Help someone with something small', 'Be patient with myself'],
  Fun: ['Do something just because I enjoy it', 'Spend time on a hobby', 'Laugh with people I like', 'Take a break without guilt'],
};

export const AWAY_EXAMPLES: Record<string, string[]> = {
  Connection: ['Cancel plans to scroll instead', 'Compare my friendships to others online', 'Avoid texting back', 'Isolate when things feel hard'],
  'Being Yourself': ["Copy someone else's style to fit in", "Hide what I'm into", 'Say yes just to seem cool', 'Change myself to match a trend'],
  Growth: ['Avoid anything I might be bad at', 'Give up after one try', 'Compare my progress to someone further along', 'Stay in my comfort zone out of fear'],
  Achievement: ['Procrastinate and then stress', "Compare my results to someone else's highlight reel", 'Give up when it gets hard', 'Only count the big wins'],
  'Health & Well-Being': ['Skip meals', 'Exercise to punish myself', 'Keep checking the account', 'Criticize my appearance'],
  Creativity: ['Compare my work to professionals online', 'Delete something before finishing it', 'Only create when I feel inspired', "Copy someone else's exact style"],
  Independence: ['Ask others to decide for me', 'Avoid things that feel uncomfortable alone', 'Let someone else take over', 'Base my choices only on what others think'],
  Kindness: ['Talk down to myself', 'Ignore someone who needs support', "Compare who's \"nicer\" online", 'Hold onto guilt instead of fixing it'],
  Fun: ['Only relax by scrolling', 'Skip things I enjoy to seem busy', "Compare my fun to someone else's highlight reel", 'Feel guilty for taking a break'],
};

export const WHEN_OPTIONS = ['Today', 'Tomorrow', 'This week', 'Choose a day and time'];

export const HELP_OPTIONS = ['Set a reminder', 'Ask someone to join me', 'Prepare what I need', 'Start with a smaller step', 'Write my own'];

export const CHECK_IN_OPTIONS = ['Yes', 'A little', 'Not really', "I'm not sure"];
