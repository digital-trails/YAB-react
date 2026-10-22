// Static content and pure game logic for the "I'm Doing It" positive-word
// game. Swap getTodayWord() for a server-driven word later without touching
// the UI components that call it.
import englishWords from 'an-array-of-english-words';

export type LetterStatus = 'correct' | 'present' | 'absent';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

// The specific positive words that can be served as the day's target.
export const TARGET_WORDS: string[] = [
  'BRAVE', 'HAPPY', 'SMILE', 'TRUST', 'PROUD', 'WORTH', 'PEACE', 'LIGHT', 'GRACE', 'BLOOM',
  'SHINE', 'BLESS', 'CHEER', 'FOCUS', 'HONOR', 'MERCY', 'MAGIC', 'ADAPT', 'VALID', 'EQUAL',
  'READY', 'SOLID', 'NOBLE', 'LOYAL', 'SWEET', 'FUNNY', 'GLORY', 'FAITH', 'CLEAR', 'FRESH',
  'SPARK', 'VIVID', 'ALIVE', 'AGILE', 'EAGER', 'WISER',
];

// Every 5-letter word in a comprehensive English dictionary, plus the target
// words themselves, so any real English word is accepted as a guess.
export const VALID_GUESSES: Set<string> = new Set([
  ...(englishWords as string[]).filter((word) => word.length === WORD_LENGTH && /^[a-z]+$/.test(word)),
  ...TARGET_WORDS.map((word) => word.toLowerCase()),
]);

/** Whether a 5-letter string is an accepted guess (target words are always accepted). */
export function isValidWord(word: string): boolean {
  return VALID_GUESSES.has(word.toLowerCase());
}

const STARTER_REFLECTIONS: string[] = [
  'One moment this week when I was {word}: ',
  'I felt most {word} when ',
  'A person who noticed me being {word}: ',
  'Something small I did that was {word}: ',
];

function getDayIndex(date: Date): number {
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(utcMidnight / 86400000);
}

/** Deterministically picks one word per calendar day (UTC) from the pool. */
export function getTodayWord(date: Date = new Date()): string {
  return TARGET_WORDS[getDayIndex(date) % TARGET_WORDS.length];
}

export function getReflectionPrompt(word: string): string {
  return `When were you ${word.toLowerCase()}?`;
}

export function getReflectionSubtitle(): string {
  return 'Write what happened and how you felt.';
}

export function getIdeaStarters(word: string): string[] {
  return STARTER_REFLECTIONS.map((template) => template.replace('{word}', word.toLowerCase()));
}

export function evaluateGuess(guess: string, target: string): LetterStatus[] {
  const guessLetters = guess.toUpperCase().split('');
  const targetLetters = target.toUpperCase().split('');
  const statuses: LetterStatus[] = guessLetters.map(() => 'absent');
  const remaining: Record<string, number> = {};

  targetLetters.forEach((letter, i) => {
    if (guessLetters[i] === letter) statuses[i] = 'correct';
    else remaining[letter] = (remaining[letter] ?? 0) + 1;
  });

  guessLetters.forEach((letter, i) => {
    if (statuses[i] === 'correct') return;
    if (remaining[letter] > 0) {
      statuses[i] = 'present';
      remaining[letter] -= 1;
    }
  });

  return statuses;
}

/** Best status seen for each guessed letter across all guesses, for keyboard coloring. */
export function mergeLetterStatuses(guesses: string[], target: string): Record<string, LetterStatus> {
  const priority: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };
  const merged: Record<string, LetterStatus> = {};
  guesses.forEach((guess) => {
    const statuses = evaluateGuess(guess, target);
    guess.toUpperCase().split('').forEach((letter, i) => {
      const status = statuses[i];
      if (!merged[letter] || priority[status] > priority[merged[letter]]) merged[letter] = status;
    });
  });
  return merged;
}
