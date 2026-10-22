import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, FlowHeader, Heading } from '@/components/ui';
import { Palette, Radius, Shadow, themedStyleSheet } from '@/constants/tokens';
import { clearModuleDraft, getModuleDraft, recordModuleCompletion, saveModuleDraft } from '@/data/module-history';
import {
  evaluateGuess,
  getIdeaStarters,
  getReflectionPrompt,
  getReflectionSubtitle,
  getTodayWord,
  isValidWord,
  MAX_GUESSES,
  mergeLetterStatuses,
  WORD_LENGTH,
  type LetterStatus,
} from '@/data/wordle-data';

// Fixed standard Wordle tile/key colors — kept independent of the app's theme
// tokens so the green/yellow/gray feedback always reads correctly.
const WORDLE_COLORS = { correct: '#538d4e', present: '#b59f3b', absent: '#787c7e' };

const WORDLE_LEGEND = [
  { emoji: '🟩', label: 'Correct spot', background: WORDLE_COLORS.correct },
  { emoji: '🟨', label: 'In the word', background: WORDLE_COLORS.present },
  { emoji: '⬛', label: 'Not in word', background: WORDLE_COLORS.absent },
];

type WinSize = 'big' | 'medium' | 'small';

type Win = {
  id: string;
  size: WinSize;
  body: string;
  date: string;
  dateKey: string;
  favorite: boolean;
};

type FutureWin = {
  id: string;
  text: string;
  size: WinSize;
};

// Fixed category colors — kept independent of the app's theme tokens so the
// win categories always read consistently (red/burgundy, gold/brown, teal/green).
const WIN_META: Record<WinSize, { singular: string; plural: string; subtitle: string; banner: string; pill: string }> = {
  big: {
    singular: 'Big Win', plural: 'Big Wins',
    subtitle: 'The bigger moments you really want to remember.',
    banner: '#7A2035', pill: '#B23A4E',
  },
  medium: {
    singular: 'Medium Win', plural: 'Medium Wins',
    subtitle: 'Things that took some effort or that you might forget to give yourself credit for.',
    banner: '#5C4423', pill: '#C9971C',
  },
  small: {
    singular: 'Small Win', plural: 'Small Wins',
    subtitle: 'The everyday things that might not seem huge, but still matter.',
    banner: '#1F4B44', pill: '#2F7D5B',
  },
};
const WIN_SIZE_ORDER: WinSize[] = ['big', 'medium', 'small'];
const WIN_CARD_DARK = '#26282B';

const WIN_IDEAS: Record<WinSize, string[]> = {
  small: [
    "Finished something I'd been putting off",
    'Asked for help',
    'Helped someone out',
    "Went to practice even though I didn't feel like it",
    'Cleaned or organized something',
    "Spoke up when I normally wouldn't",
  ],
  medium: [
    'Finished a difficult assignment',
    'Learned something new',
    'Helped organize something',
    'Improved at a sport, hobby, or skill',
    'Worked through a problem with a friend',
    'Kept working toward something that mattered to me',
  ],
  big: [
    'Finished a big project',
    "Reached a goal I'd been working toward",
    'Made a team, club, performance, or activity',
    'Improved at something after working on it for a long time',
    'Did something that felt really difficult',
    "Accomplished something I didn't think I could do",
  ],
};

const NOT_SURE_COPY = "There's no right answer. Pick whichever one feels closest. If you're proud of it, it belongs here.";

const initialWins: Win[] = [
  { id: 'w1', size: 'small', body: 'Finished something I had been putting off all week.', date: 'Jul 30', dateKey: '2026-07-30', favorite: false },
  { id: 'w2', size: 'small', body: 'Made my friend laugh when they were having a rough day.', date: 'Aug 1', dateKey: '2026-08-01', favorite: true },
  { id: 'w3', size: 'medium', body: 'Improved at something after working on it for a while.', date: 'Aug 4', dateKey: '2026-08-04', favorite: false },
  { id: 'w4', size: 'medium', body: 'Asked for help instead of giving up on my homework.', date: 'Aug 5', dateKey: '2026-08-05', favorite: false },
  { id: 'w5', size: 'big', body: 'Finished a science project I worked on for three weeks.', date: 'Jul 28', dateKey: '2026-07-28', favorite: true },
];

function formatShortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const words = [
  'Brave', 'Kind', 'Patient', 'Creative', 'Strong', 'Thoughtful', 'Caring', 'Curious', 'Resilient',
  'Honest', 'Loyal', 'Generous', 'Determined', 'Funny', 'Gentle', 'Confident', 'Adventurous', 'Calm',
  'Hardworking', 'Open-minded', 'Forgiving', 'Optimistic', 'Reliable', 'Playful',
];

const CARD_COUNT = 9;

function shuffleWords(list: string[]): string[] {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandomWords(pool: string[], count: number): string[] {
  return shuffleWords(pool).slice(0, count);
}

const GRATITUDE_PROMPTS: { label: string; question: string }[] = [
  { label: 'Someone', question: "Who's someone you're glad to have in your life right now?" },
  { label: 'Something small', question: "What's one little thing that made today better?" },
  { label: 'A moment', question: "What's a moment from lately that you're glad happened?" },
  { label: 'A place', question: "Where's somewhere you're happy you get to spend time?" },
  { label: 'Something funny', question: 'What made you laugh or smile recently?' },
  { label: 'Something that helped', question: 'What made something a little easier for you lately?' },
  { label: 'Something you have', question: "What's something in your life you're really glad you have?" },
  { label: 'Someone did for you', question: 'Did someone do something small for you that you appreciated?' },
  { label: 'A good surprise', question: "What's something that turned out better than you expected?" },
  { label: 'A memory', question: "What's a moment you'd want to remember?" },
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
];

type GamePhase = 'playing' | 'reflect';

export default function AccomplishmentsFlow() {
  const router = useRouter();
  const { section, resume } = useLocalSearchParams<{ section?: string; resume?: string }>();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<'game' | 'wins' | 'addWin' | 'thanks' | 'thanksAdd' | 'cards' | 'cardsReflect' | 'browseByDate' | 'futureWins'>((section === 'wins' ? 'wins' : section === 'thanks' ? 'thanks' : 'game'));
  const [win, setWin] = useState('');
  const [winCategory, setWinCategory] = useState<WinSize | null>(null);
  const [winsList, setWinsList] = useState<Win[]>(initialWins);
  const [expandedTiers, setExpandedTiers] = useState<Record<WinSize, boolean>>({ big: false, medium: false, small: false });
  const [futureWins, setFutureWins] = useState<FutureWin[]>([]);
  const [futureWinText, setFutureWinText] = useState('');
  const [futureWinCategory, setFutureWinCategory] = useState<WinSize | null>(null);
  const [showWinIdeas, setShowWinIdeas] = useState(false);
  const [showNotSure, setShowNotSure] = useState(false);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calSelectedDay, setCalSelectedDay] = useState<number | null>(null);
  const [thanks, setThanks] = useState('');
  const [showGratitudeIdeas, setShowGratitudeIdeas] = useState(false);
  const [cardWords, setCardWords] = useState<string[]>(() => pickRandomWords(words, CARD_COUNT));
  const [word, setWord] = useState<string | null>(null);
  const [appreciationText, setAppreciationText] = useState('');

  const [targetWord] = useState(() => getTodayWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gamePhase, setGamePhase] = useState<GamePhase>('playing');
  const [wordleWon, setWordleWon] = useState<boolean | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [shakeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!resume) return;
    void getModuleDraft().then((draft) => {
      if (!draft || draft.moduleId !== 'accomplishments') return;
      const state = draft.state as {
        page?: typeof page; win?: string; thanks?: string; word?: string | null; appreciationText?: string;
        guesses?: string[]; currentGuess?: string; gamePhase?: GamePhase; wordleWon?: boolean | null; reflectionText?: string;
      } | undefined;
      if (state?.page) setPage(state.page);
      if (state) {
        setWin(state.win ?? '');
        setThanks(state.thanks ?? '');
        setWord(state.word ?? null);
        setAppreciationText(state.appreciationText ?? '');
        setGuesses(state.guesses ?? []);
        setCurrentGuess(state.currentGuess ?? '');
        setGamePhase(state.gamePhase ?? 'playing');
        setWordleWon(state.wordleWon ?? null);
        setReflectionText(state.reflectionText ?? '');
      }
    });
  }, [resume]);

  useEffect(() => {
    const gameInProgress = guesses.length > 0 || !!currentGuess || gamePhase === 'reflect';
    if (page === 'game' && !gameInProgress) return;
    void saveModuleDraft({
      moduleId: 'accomplishments',
      title: 'Notice the good',
      route: `/accomplishments-flow?section=${section ?? 'game'}`,
      step: 0,
      totalSteps: 1,
      state: { page, win, thanks, word, appreciationText, guesses, currentGuess, gamePhase, wordleWon, reflectionText },
    });
  }, [appreciationText, currentGuess, gamePhase, guesses, page, reflectionText, section, thanks, win, word, wordleWon]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const complete = async (moduleId: string, title: string, body?: string, metadata?: Record<string, string | number | boolean | null>) => {
    await recordModuleCompletion({ moduleId, title, body, metadata });
    await clearModuleDraft('accomplishments');
    goBack();
  };

  const back = () => {
    if (page === 'addWin' || page === 'browseByDate' || page === 'futureWins') setPage('wins');
    else if (page === 'thanksAdd' || page === 'cards') setPage('thanks');
    else if (page === 'cardsReflect') setPage('cards');
    else goBack();
  };
  const shell = (title: string, children: ReactNode) => <Shell title={title} onBack={back} insets={insets}>{children}</Shell>;

  const keyStatuses = mergeLetterStatuses(guesses, targetWord);

  const triggerInvalidShake = () => {
    setInvalidGuess(true);
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setInvalidGuess(false), 1400);
  };

  const handleKeyPress = (key: string) => {
    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) return;
      if (!isValidWord(currentGuess)) {
        triggerInvalidShake();
        return;
      }
      const nextGuesses = [...guesses, currentGuess];
      setGuesses(nextGuesses);
      setCurrentGuess('');
      if (currentGuess === targetWord) {
        setWordleWon(true);
        setGamePhase('reflect');
      } else if (nextGuesses.length >= MAX_GUESSES) {
        setWordleWon(false);
        setGamePhase('reflect');
      }
      return;
    }
    if (key === 'DELETE') {
      setCurrentGuess((g) => g.slice(0, -1));
      return;
    }
    setCurrentGuess((g) => (g.length < WORD_LENGTH ? g + key : g));
  };

  const handleIdea = () => {
    const starters = getIdeaStarters(targetWord);
    setReflectionText(starters[ideaIndex % starters.length]);
    setIdeaIndex((i) => i + 1);
  };

  const surpriseMeGratitude = () => {
    const idx = Math.floor(Math.random() * GRATITUDE_PROMPTS.length);
    setThanks(GRATITUDE_PROMPTS[idx].question);
    setShowGratitudeIdeas(false);
  };

  const pickGratitudePrompt = (question: string) => {
    setThanks(question);
    setShowGratitudeIdeas(false);
  };

  const saveReflection = () => complete('doing-it', 'I’m Doing It', reflectionText.trim(), { word: targetWord, won: wordleWon ?? false, guessCount: guesses.length });

  const toggleFavorite = (id: string) => setWinsList((list) => list.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)));

  const addWin = async () => {
    const trimmed = win.trim();
    if (!trimmed || !winCategory) return;
    const today = new Date();
    setWinsList((list) => [{ id: `w-${Date.now()}`, size: winCategory, body: trimmed, date: formatShortDate(today), dateKey: toDateKey(today), favorite: false }, ...list]);
    await recordModuleCompletion({ moduleId: 'wins', title: 'My Wins', body: trimmed, metadata: { size: winCategory } });
    setWin('');
    setWinCategory(null);
    setShowWinIdeas(false);
    setShowNotSure(false);
    setPage('wins');
  };

  const addFutureWin = () => {
    const trimmed = futureWinText.trim();
    if (!trimmed || !futureWinCategory) return;
    setFutureWins((list) => [{ id: `fut-${Date.now()}`, text: trimmed, size: futureWinCategory }, ...list]);
    setFutureWinText('');
    setFutureWinCategory(null);
  };

  const moveFutureWinToWins = async (item: FutureWin) => {
    const today = new Date();
    setFutureWins((list) => list.filter((entry) => entry.id !== item.id));
    setWinsList((list) => [{ id: `w-${Date.now()}`, size: item.size, body: item.text, date: formatShortDate(today), dateKey: toDateKey(today), favorite: false }, ...list]);
    await recordModuleCompletion({ moduleId: 'wins', title: 'My Wins', body: item.text, metadata: { size: item.size, fromFutureWin: true } });
  };

  if (page === 'game' && gamePhase === 'playing') return shell('✨ I’m Doing It', <WordleGame targetWord={targetWord} guesses={guesses} currentGuess={currentGuess} keyStatuses={keyStatuses} onKeyPress={handleKeyPress} invalidGuess={invalidGuess} shakeAnim={shakeAnim} />);
  if (page === 'game') return shell('✨ I’m Doing It', <WordleReflection word={targetWord} won={wordleWon ?? false} reflectionText={reflectionText} onChangeText={setReflectionText} onIdea={handleIdea} onSave={saveReflection} />);
  if (page === 'wins') {
    const favorites = winsList.filter((item) => item.favorite);
    const openAddWin = (size: WinSize | null) => { setWinCategory(size); setShowWinIdeas(false); setShowNotSure(false); setPage('addWin'); };
    return shell('My Accomplishments', <>
      <Text style={styles.privacyPill}>This is just for you.</Text>
      <View style={styles.navRow}>
        <Pressable style={styles.navBtn} onPress={() => { setCalSelectedDay(null); setPage('browseByDate'); }}><Text style={styles.navBtnLabel}>Browse by Date</Text></Pressable>
        <Pressable style={styles.navBtn} onPress={() => setPage('futureWins')}><Text style={styles.navBtnLabel}>Future Wins</Text></Pressable>
      </View>
      {favorites.length > 0 ? (
        <View style={styles.spotlightSection}>
          <View style={styles.spotlightHeaderRow}>
            <Heading style={styles.sectionTitle}>Spotlight Wins</Heading>
            <Text style={styles.sectionSubtitle}>your favorites</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spotlightScroll}>
            {favorites.map((item) => <SpotlightCard key={item.id} win={item} />)}
          </ScrollView>
        </View>
      ) : null}
      <Btn label="+ Add an accomplishment" onPress={() => openAddWin(null)} style={styles.primaryAction} />
      {WIN_SIZE_ORDER.map((size) => {
        const tierWins = winsList.filter((item) => item.size === size);
        const isExpanded = expandedTiers[size];
        const visibleWins = isExpanded ? tierWins : tierWins.slice(0, 2);
        return (
          <View key={size} style={styles.categorySection}>
            <CategoryHeader size={size} onAdd={() => openAddWin(size)} />
            <View style={styles.categoryCards}>
              {visibleWins.map((item) => <AccomplishmentCard key={item.id} win={item} onToggleFavorite={toggleFavorite} />)}
            </View>
            {tierWins.length > 2 ? (
              <Pressable onPress={() => setExpandedTiers((prev) => ({ ...prev, [size]: !prev[size] }))} style={styles.expandToggle}>
                <Text style={[styles.expandToggleLabel, { color: WIN_META[size].pill }]}>
                  {isExpanded ? '↑ Show less' : `↓ See all ${tierWins.length} ${WIN_META[size].singular.toLowerCase()}s`}
                </Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </>);
  }
  if (page === 'browseByDate') {
    const calGrid = buildCalendarGrid(calYear, calMonth);
    const tiersByDay: Record<number, WinSize[]> = {};
    winsList.forEach((item) => {
      const [y, m, d] = item.dateKey.split('-').map(Number);
      if (y === calYear && m - 1 === calMonth) {
        if (!tiersByDay[d]) tiersByDay[d] = [];
        tiersByDay[d].push(item.size);
      }
    });
    const selectedDateKey = calSelectedDay !== null ? buildDateKey(calYear, calMonth, calSelectedDay) : null;
    const selectedWins = selectedDateKey ? winsList.filter((item) => item.dateKey === selectedDateKey) : [];
    const todayKey = toDateKey(new Date());
    const goToPrevMonth = () => {
      if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); } else setCalMonth((m) => m - 1);
      setCalSelectedDay(null);
    };
    const goToNextMonth = () => {
      if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); } else setCalMonth((m) => m + 1);
      setCalSelectedDay(null);
    };
    return shell('Browse by Date', <>
      <View style={styles.calendarHeaderRow}>
        <Pressable onPress={goToPrevMonth} style={styles.calendarNavBtn}><Text style={styles.calendarNavLabel}>←</Text></Pressable>
        <Heading style={styles.calendarMonthLabel}>{MONTH_NAMES[calMonth]} {calYear}</Heading>
        <Pressable onPress={goToNextMonth} style={styles.calendarNavBtn}><Text style={styles.calendarNavLabel}>→</Text></Pressable>
      </View>
      <View style={styles.calendarWeekRow}>
        {WEEKDAY_LABELS.map((label, i) => <Text key={i} style={styles.calendarWeekDayLabel}>{label}</Text>)}
      </View>
      <View style={styles.calendarGrid}>
        {calGrid.map((week, wi) => (
          <View key={wi} style={styles.calendarWeekRow}>
            {week.map((day, di) => {
              if (day === null) return <View key={di} style={styles.calendarCell} />;
              const tiers = tiersByDay[day] ?? [];
              const isSelected = calSelectedDay === day;
              const isToday = buildDateKey(calYear, calMonth, day) === todayKey;
              return (
                <Pressable
                  key={di}
                  onPress={() => setCalSelectedDay((prev) => (prev === day ? null : day))}
                  style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}>
                  <Text style={[styles.calendarDayLabel, isSelected && styles.calendarDayLabelSelected, !isSelected && isToday ? { color: WIN_META.big.pill } : null]}>
                    {day}
                  </Text>
                  {tiers.length > 0 ? (
                    <View style={styles.calendarDotRow}>
                      {WIN_SIZE_ORDER.filter((size) => tiers.includes(size)).map((size) => (
                        <View key={size} style={[styles.calendarDot, { backgroundColor: WIN_META[size].pill }]} />
                      ))}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.calendarLegendRow}>
        {WIN_SIZE_ORDER.map((size) => (
          <View key={size} style={styles.calendarLegendItem}>
            <View style={[styles.calendarLegendDot, { backgroundColor: WIN_META[size].pill }]} />
            <Text style={styles.calendarLegendLabel}>{WIN_META[size].singular}</Text>
          </View>
        ))}
      </View>
      {calSelectedDay !== null ? (
        <>
          <Heading style={styles.calendarSelectedHeading}>{MONTH_NAMES[calMonth]} {calSelectedDay}</Heading>
          {selectedWins.length === 0 ? (
            <Text style={styles.muted}>Nothing recorded on this day.</Text>
          ) : (
            selectedWins.map((item) => <AccomplishmentCard key={item.id} win={item} onToggleFavorite={toggleFavorite} />)
          )}
        </>
      ) : (
        <Text style={styles.muted}>Tap a day to see your wins.</Text>
      )}
    </>);
  }
  if (page === 'futureWins') return shell('Future Wins', <>
    <Text style={styles.body}>Jot down wins you&apos;re working toward, so you can look forward to celebrating them later.</Text>
    <TextInput value={futureWinText} onChangeText={setFutureWinText} multiline placeholder="What&apos;s a win you&apos;re working toward?" placeholderTextColor={Palette.neutral600} style={styles.input} />
    <Text style={styles.kicker}>HOW BIG WILL IT BE?</Text>
    <View style={styles.choices}>
      {WIN_SIZE_ORDER.map((size) => (
        <Pressable key={size} onPress={() => setFutureWinCategory(size)} style={[styles.choice, futureWinCategory === size && styles.choiceOn]}>
          <Text style={styles.body}>{WIN_META[size].singular}</Text>
        </Pressable>
      ))}
    </View>
    <Btn label="Add" disabled={!futureWinText.trim() || !futureWinCategory} onPress={addFutureWin} />
    {futureWins.map((item) => (
      <View key={item.id} style={styles.futureCard}>
        <View style={styles.futureTopRow}>
          <Text style={[styles.winBadge, { backgroundColor: WIN_META[item.size].pill }]}>{WIN_META[item.size].singular}</Text>
        </View>
        <Text style={styles.body}>{item.text}</Text>
        <Pressable onPress={() => moveFutureWinToWins(item)} style={styles.futureMoveBtn}>
          <Text style={styles.futureMoveLabel}>✓ I did it — move to My Wins</Text>
        </Pressable>
      </View>
    ))}
  </>);
  if (page === 'addWin') return shell('My Accomplishments', <>
    <Heading style={styles.question}>What&apos;d you get done?</Heading>
    <Text style={styles.body}>There&apos;s no wrong answer. Every accomplishment counts.</Text>
    <TextInput value={win} onChangeText={setWin} multiline placeholder="Write it here…" placeholderTextColor={Palette.neutral600} style={styles.input} />
    <Text style={styles.kicker}>HOW BIG WAS IT?</Text>
    <View style={styles.choices}>
      {WIN_SIZE_ORDER.map((size) => (
        <Pressable key={size} onPress={() => { setWinCategory(size); setShowWinIdeas(false); }} style={[styles.choice, winCategory === size && styles.choiceOn]}>
          <Text style={styles.body}>{WIN_META[size].singular}</Text>
        </Pressable>
      ))}
    </View>
    <Btn label="Not sure?" variant="ghost" onPress={() => setShowNotSure((v) => !v)} />
    {showNotSure ? <View style={styles.ideaBox}><Text style={styles.ideaBoxText}>{NOT_SURE_COPY}</Text></View> : null}
    {winCategory ? <Btn label="I need an idea" variant="ghost" onPress={() => setShowWinIdeas((v) => !v)} /> : null}
    {showWinIdeas && winCategory ? (
      <View style={styles.ideaBox}>
        {WIN_IDEAS[winCategory].map((idea, i) => (
          <View key={i} style={styles.ideaRow}>
            <Text style={styles.ideaBullet}>•</Text>
            <Text style={styles.ideaBoxText}>{idea}</Text>
          </View>
        ))}
      </View>
    ) : null}
    <Btn label="Add my win" disabled={!win.trim() || !winCategory} onPress={addWin} />
  </>);
  if (page === 'thanks') return shell('🙏 My Thanks', <><Text style={styles.privacy}>🔒 This is just for you.</Text><View style={styles.card}><Text style={styles.icon}>💛</Text><Heading style={styles.cardTitle}>Something I&apos;m Thankful For</Heading><Text style={styles.body}>Taking a second to notice the good stuff, big or small, can help you appreciate what&apos;s already around you.</Text><Btn label="Start" onPress={() => setPage('thanksAdd')} /></View><View style={styles.card}><Text style={styles.icon}>🃏</Text><Heading style={styles.cardTitle}>Something I Appreciate About Myself</Heading><Text style={styles.body}>Shuffle positive words until one feels like you.</Text><Btn label="Start" onPress={() => setPage('cards')} /></View></>);
  if (page === 'thanksAdd') return shell('My Thanks', <>
    <Text style={styles.icon}>💛</Text>
    <Heading style={styles.question}>Something I&apos;m Thankful For</Heading>
    <Text style={styles.body}>What&apos;s something you&apos;re thankful for today?</Text>
    <TextInput value={thanks} onChangeText={setThanks} multiline placeholder="Write it here…" placeholderTextColor={Palette.neutral600} style={styles.input} />
    <View style={styles.navRow}>
      <Btn label="Surprise me" variant="ghost" onPress={surpriseMeGratitude} />
      <Btn label={showGratitudeIdeas ? 'Hide' : 'Pick one'} variant="ghost" onPress={() => setShowGratitudeIdeas((v) => !v)} />
    </View>
    {showGratitudeIdeas ? (
      <View style={styles.ideaBox}>
        {GRATITUDE_PROMPTS.map((prompt, i) => (
          <Pressable key={i} onPress={() => pickGratitudePrompt(prompt.question)} style={styles.gratitudePromptItem}>
            <Text style={styles.gratitudePromptLabel}>{prompt.label}</Text>
            <Text style={styles.gratitudePromptQuestion}>{prompt.question}</Text>
          </Pressable>
        ))}
      </View>
    ) : null}
    <Btn label="Save" disabled={!thanks.trim()} onPress={() => complete('thanks', 'My Thanks', thanks.trim())} />
  </>);
  if (page === 'cards') return shell('My Thanks', <>
    <Heading style={styles.question}>Something I Appreciate About Myself</Heading>
    <Text style={styles.body}>Tap a card to flip it and reveal a word.</Text>
    <View style={styles.cardGrid}>
      {cardWords.map((item) => (
        <Pressable
          key={item}
          onPress={() => setWord((current) => (current === item ? null : item))}
          style={[styles.wordCard, word === item && styles.wordCardOn]}
        >
          <Text style={styles.body}>{word === item ? item : '✦'}</Text>
        </Pressable>
      ))}
    </View>
    <Btn label="Shuffle the deck" variant="ghost" onPress={() => { setCardWords(pickRandomWords(words, CARD_COUNT)); setWord(null); }} />
    <Btn
      label="Continue"
      disabled={!word}
      onPress={() => { setAppreciationText(word ? `I appreciate that I am ${word} because ` : ''); setPage('cardsReflect'); }}
    />
  </>);
  return shell('My Thanks', <SelfAppreciationReflect
    word={word}
    text={appreciationText}
    onChangeText={setAppreciationText}
    onSave={() => complete('self-appreciation', 'Something I Appreciate About Myself', appreciationText.trim(), { word: word ?? '' })}
  />);
}

function Shell({ title, onBack, insets, children }: { title: string; onBack: () => void; insets: { top: number; bottom: number }; children: ReactNode }) { return <View style={[styles.screen, { paddingTop: insets.top }]}><FlowHeader title={title} onBack={onBack} onClose={onBack} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView><View style={{ height: insets.bottom + 12 }} /></View>; }

function tileStyle(status?: LetterStatus) {
  if (status === 'correct') return styles.letterCorrect;
  if (status === 'present') return styles.letterPresent;
  if (status === 'absent') return styles.letterAbsent;
  return null;
}

function keyStyle(status?: LetterStatus) {
  if (status === 'correct') return styles.keyCorrect;
  if (status === 'present') return styles.keyPresent;
  if (status === 'absent') return styles.keyAbsent;
  return null;
}

function WordleGame({ targetWord, guesses, currentGuess, keyStatuses, onKeyPress, invalidGuess, shakeAnim }: {
  targetWord: string;
  guesses: string[];
  currentGuess: string;
  keyStatuses: Record<string, LetterStatus>;
  onKeyPress: (key: string) => void;
  invalidGuess: boolean;
  shakeAnim: Animated.Value;
}) {
  const shakeStyle = { transform: [{ translateX: shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }] };
  return (
    <>
      <Heading style={styles.question}>Guess today&apos;s positive 5-letter word</Heading>
      <View style={styles.legendRow}>
        {WORDLE_LEGEND.map((item) => (
          <View key={item.label} style={[styles.legendPill, { backgroundColor: item.background }]}>
            <Text style={styles.legendPillText}>{item.emoji} {item.label}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.toast, !invalidGuess && styles.toastHidden]}>Not in word list</Text>
      <View style={styles.board}>
        {Array.from({ length: MAX_GUESSES }, (_, row) => {
          const submitted = row < guesses.length;
          const isActiveRow = row === guesses.length;
          const rowWord = submitted ? guesses[row] : isActiveRow ? currentGuess : '';
          const statuses = submitted ? evaluateGuess(rowWord, targetWord) : null;
          return (
            <Animated.View key={row} style={[styles.guessRow, isActiveRow && invalidGuess && shakeStyle]}>
              {Array.from({ length: WORD_LENGTH }, (_, col) => {
                const status = statuses?.[col];
                return (
                  <View key={col} style={[styles.letter, tileStyle(status)]}>
                    <Text style={[styles.letterText, status && styles.letterTextFilled]}>{rowWord[col] ?? ''}</Text>
                  </View>
                );
              })}
            </Animated.View>
          );
        })}
      </View>
      <View style={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, i) => (
          <View key={i} style={styles.keyboardRow}>
            {row.map((key) => {
              const status = keyStatuses[key];
              const label = key === 'DELETE' ? '⌫' : key === 'ENTER' ? 'Enter' : key;
              return (
                <Pressable
                  key={key}
                  onPress={() => onKeyPress(key)}
                  style={[styles.key, (key === 'ENTER' || key === 'DELETE') && styles.keyWide, keyStyle(status)]}>
                  <Text style={[styles.keyLabel, status && styles.keyLabelFilled]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </>
  );
}

function WordleReflection({ word, won, reflectionText, onChangeText, onIdea, onSave }: {
  word: string;
  won: boolean;
  reflectionText: string;
  onChangeText: (text: string) => void;
  onIdea: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <View style={styles.guessRow}>
        {word.split('').map((letter, i) => (
          <View key={i} style={[styles.letter, styles.letterCorrect]}>
            <Text style={[styles.letterText, styles.letterTextFilled]}>{letter}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.body}>{won ? 'You got it!' : 'So close, next time!'}</Text>
      <Heading style={styles.question}>{getReflectionPrompt(word)}</Heading>
      <Text style={styles.body}>{getReflectionSubtitle()}</Text>
      <TextInput value={reflectionText} onChangeText={onChangeText} multiline placeholder="Write it here…" placeholderTextColor={Palette.neutral600} style={styles.input} />
      <Btn label="Need an idea?" variant="ghost" onPress={onIdea} />
      <Btn label="Add to My Board" disabled={!reflectionText.trim()} onPress={onSave} />
    </>
  );
}

function SelfAppreciationReflect({ word, text, onChangeText, onSave }: {
  word: string | null;
  text: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
}) {
  return (
    <>
      <View style={styles.wordBadge}><Text style={styles.wordBadgeText}>✦ {word}</Text></View>
      <Heading style={styles.question}>Why does this feel true for you?</Heading>
      <TextInput value={text} onChangeText={onChangeText} multiline placeholder="Write it here…" placeholderTextColor={Palette.neutral600} style={styles.input} />
      <Btn label="Save to My Board" disabled={!text.trim()} onPress={onSave} />
    </>
  );
}

function CategoryHeader({ size, onAdd }: { size: WinSize; onAdd: () => void }) {
  const meta = WIN_META[size];
  return (
    <View style={[styles.categoryHeader, { backgroundColor: meta.banner }]}>
      <View style={styles.categoryHeaderText}>
        <Heading style={styles.categoryTitle}>{meta.plural}</Heading>
        <Text style={styles.categorySubtitle}>{meta.subtitle}</Text>
      </View>
      <Pressable onPress={onAdd} style={styles.categoryAddBtn}><Text style={styles.categoryAddLabel}>+ Add</Text></Pressable>
    </View>
  );
}

function SpotlightCard({ win }: { win: Win }) {
  const meta = WIN_META[win.size];
  return (
    <View style={styles.spotlightCard}>
      <View style={styles.spotlightTopRow}>
        <Text style={[styles.winBadge, { backgroundColor: meta.pill }]}>{meta.singular}</Text>
        <Text style={styles.spotlightStar}>★</Text>
      </View>
      <Text style={styles.body}>{win.body}</Text>
      <Text style={styles.date}>{win.date}</Text>
    </View>
  );
}

function AccomplishmentCard({ win, onToggleFavorite }: { win: Win; onToggleFavorite: (id: string) => void }) {
  return (
    <View style={styles.winCard}>
      <Text style={styles.winBody}>{win.body}</Text>
      <View style={styles.winFooterRow}>
        <Text style={styles.winDate}>{win.date}</Text>
        <Pressable onPress={() => onToggleFavorite(win.id)} hitSlop={8}>
          <Text style={styles.winStarText}>{win.favorite ? '★' : '☆'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  screen: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, gap: 16 },
  body: { color: Palette.text, fontSize: 15, lineHeight: 22 },
  muted: { color: Palette.neutral700, fontSize: 14, lineHeight: 20 },
  privacy: { color: Palette.accent2_700, fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: Palette.neutral100, borderRadius: Radius.xl, borderWidth: 1, borderColor: Palette.neutral300, padding: 18, gap: 8, boxShadow: Shadow.elevSm },
  icon: { fontSize: 25 },
  cardTitle: { fontSize: 20 },
  kicker: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700', letterSpacing: 0.7 },
  question: { fontSize: 22, color: Palette.text },
  input: { minHeight: 110, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, padding: 14, color: Palette.text, textAlignVertical: 'top', boxShadow: Shadow.elevSm },
  choices: { gap: 10 },
  choice: { padding: 15, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, boxShadow: Shadow.elevSm },
  choiceOn: { borderColor: Palette.accent2, backgroundColor: Palette.accent2_100, boxShadow: Shadow.lg },
  date: { color: Palette.neutral600, fontSize: 11 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  wordCard: { width: '30%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.lg, backgroundColor: Palette.accent2_100, boxShadow: Shadow.elevSm },
  wordCardOn: { borderWidth: 2, borderColor: Palette.accent2_700, boxShadow: Shadow.lg },
  wordBadge: { alignSelf: 'flex-start', backgroundColor: Palette.accent2_100, paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.pill },
  wordBadgeText: { color: Palette.accent2_700, fontSize: 15, fontWeight: '700' },

  privacyPill: { alignSelf: 'flex-start', color: '#fff', backgroundColor: '#1F4B44', fontSize: 13, fontWeight: '700', paddingVertical: 6, paddingHorizontal: 14, borderRadius: Radius.pill, overflow: 'hidden' },
  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1, alignItems: 'center', padding: 14, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, boxShadow: Shadow.elevSm },
  navBtnLabel: { color: Palette.text, fontSize: 14, fontWeight: '700' },

  spotlightSection: { gap: 10 },
  spotlightHeaderRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  sectionTitle: { fontSize: 20 },
  sectionSubtitle: { color: Palette.neutral700, fontSize: 13, fontStyle: 'italic' },
  spotlightScroll: { gap: 12, paddingRight: 4 },
  spotlightCard: { width: 220, gap: 10, padding: 16, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, backgroundColor: Palette.neutral100, boxShadow: Shadow.elevSm },
  spotlightTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spotlightStar: { color: '#F2C94C', fontSize: 18 },
  winBadge: { color: '#fff', fontSize: 11, fontWeight: '700', paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.pill, overflow: 'hidden' },

  primaryAction: { backgroundColor: '#E2574C', paddingVertical: 16 },

  categorySection: { gap: 0 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: Radius.lg, boxShadow: Shadow.elevSm },
  categoryHeaderText: { flex: 1, gap: 4 },
  categoryTitle: { color: '#fff', fontSize: 18 },
  categorySubtitle: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 12.5, lineHeight: 17 },
  categoryAddBtn: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.6)', borderRadius: Radius.pill, paddingVertical: 6, paddingHorizontal: 12 },
  categoryAddLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  categoryCards: { gap: 10, marginTop: 10 },

  winCard: { backgroundColor: WIN_CARD_DARK, borderRadius: Radius.lg, padding: 16, gap: 6, boxShadow: Shadow.elevSm },
  winFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  winStarText: { color: '#F2C94C', fontSize: 18 },
  winBody: { color: '#F5F5F0', fontSize: 14.5, lineHeight: 21 },
  winDate: { color: '#B8B8B8', fontSize: 11 },

  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.pill },
  legendPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  board: { gap: 8 },
  guessRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  letter: { width: 48, height: 48, borderWidth: 1, borderColor: Palette.neutral300, backgroundColor: Palette.neutral100, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm },
  letterText: { fontSize: 20, fontWeight: '700', color: Palette.text },
  letterTextFilled: { color: '#fff' },
  letterCorrect: { backgroundColor: WORDLE_COLORS.correct, borderColor: WORDLE_COLORS.correct },
  letterPresent: { backgroundColor: WORDLE_COLORS.present, borderColor: WORDLE_COLORS.present },
  letterAbsent: { backgroundColor: WORDLE_COLORS.absent, borderColor: WORDLE_COLORS.absent },

  toast: { alignSelf: 'center', color: '#fff', backgroundColor: '#3a3a3c', fontWeight: '700', fontSize: 13, paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.pill, overflow: 'hidden' },
  toastHidden: { opacity: 0 },

  keyboard: { gap: 8 },
  keyboardRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  key: { flex: 1, maxWidth: 34, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.neutral200, borderRadius: 6 },
  keyWide: { flex: 1.6, maxWidth: 56 },
  keyLabel: { fontSize: 13, fontWeight: '700', color: Palette.text },
  keyLabelFilled: { color: '#fff' },
  keyCorrect: { backgroundColor: WORDLE_COLORS.correct },
  keyPresent: { backgroundColor: WORDLE_COLORS.present },
  keyAbsent: { backgroundColor: WORDLE_COLORS.absent },

  expandToggle: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  expandToggleLabel: { fontSize: 13, fontWeight: '700' },

  ideaBox: { backgroundColor: Palette.accent2_100, borderRadius: Radius.lg, padding: 14, gap: 8 },
  ideaBoxText: { color: Palette.text, fontSize: 13.5, lineHeight: 19, flex: 1 },
  ideaRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  ideaBullet: { color: Palette.accent2_700, fontWeight: '700' },

  futureCard: { backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 16, gap: 8, boxShadow: Shadow.elevSm },
  futureTopRow: { flexDirection: 'row' },
  futureMoveBtn: { alignSelf: 'flex-start', backgroundColor: Palette.accent2_100, borderRadius: Radius.pill, paddingVertical: 8, paddingHorizontal: 14 },
  futureMoveLabel: { color: Palette.accent2_700, fontSize: 13, fontWeight: '700' },

  calendarHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calendarNavBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.neutral100, boxShadow: Shadow.elevSm },
  calendarNavLabel: { fontSize: 16, fontWeight: '700', color: Palette.text },
  calendarMonthLabel: { fontSize: 18 },
  calendarWeekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calendarWeekDayLabel: { width: '14.28%', textAlign: 'center', fontSize: 11, fontWeight: '700', color: Palette.neutral600 },
  calendarGrid: { gap: 2 },
  calendarCell: { width: '14.28%', height: 44, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: Radius.sm },
  calendarCellSelected: { backgroundColor: Palette.accent2_700 },
  calendarDayLabel: { fontSize: 13, fontWeight: '700', color: Palette.text },
  calendarDayLabelSelected: { color: '#fff' },
  calendarDotRow: { flexDirection: 'row', gap: 3 },
  calendarDot: { width: 5, height: 5, borderRadius: 2.5 },
  calendarLegendRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  calendarLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calendarLegendDot: { width: 8, height: 8, borderRadius: 4 },
  calendarLegendLabel: { fontSize: 12, color: Palette.neutral700, fontWeight: '600' },
  calendarSelectedHeading: { fontSize: 16 },

  gratitudePromptItem: { backgroundColor: Palette.accent2_100, borderRadius: Radius.sm, paddingVertical: 10, paddingHorizontal: 12, gap: 2 },
  gratitudePromptLabel: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700' },
  gratitudePromptQuestion: { color: Palette.text, fontSize: 13, lineHeight: 18 },
}));
