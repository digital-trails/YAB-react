import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, FlowHeader, Heading } from '@/components/ui';
import { Palette, Radius, Shadow, themedStyleSheet } from '@/constants/tokens';
import { clearModuleDraft, getModuleDraft, recordModuleCompletion, saveModuleDraft } from '@/data/module-history';
import {
  isCorrectAnswer,
  REALITY_QUESTIONS,
  TAKEAWAYS,
  TYPE_BADGES,
  type QuestionType,
  type RealityQuestion,
} from '@/data/reality-quiz-data';

// Fixed answer-card accents — kept independent of the app's theme tokens so
// the Kahoot-style tappable cards keep their playful color variety across
// every theme (same trade-off as the win-tier colors in accomplishments-flow
// and the Wordle tile colors: semantic/visual variety wins over theming here).
const OPTION_COLORS = [
  { bg: '#6B4FA8', text: '#FFFFFF' },
  { bg: '#B23A4E', text: '#FFFFFF' },
  { bg: '#C9971C', text: '#2D2D2D' },
  { bg: '#2F7D5B', text: '#FFFFFF' },
];

const GYM_POSTS = [
  { user: 'fit_tyler', emoji: '💪', caption: 'Morning grind never misses', likes: '2.1k' },
  { user: 'strong.sara', emoji: '🏋️', caption: 'PR day!! so proud', likes: '934' },
  { user: 'gymrat_kai', emoji: '🔥', caption: 'Consistency > motivation', likes: '1.4k' },
];

const PERSON_STAT_FILLED = [1, 2, 4, 5];

const TOTAL_QUESTIONS = REALITY_QUESTIONS.length;

type Screen = 'intro' | 'quiz' | 'result';

function typeBadgeColors(type: QuestionType): { bg: string; text: string } {
  if (type === 'didyouknow' || type === 'mockfeed') return { bg: Palette.accent100, text: Palette.accent700 };
  if (type === 'scenario') return { bg: Palette.neutral200, text: Palette.neutral700 };
  return { bg: Palette.accent2_100, text: Palette.accent2_700 };
}

export default function RealityFlowScreen() {
  const router = useRouter();
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (resume !== '1') return;
    void getModuleDraft().then((draft) => {
      if (!draft || draft.moduleId !== 'reality') return;
      const state = draft.state as { screen?: Screen; questionIndex?: number; selectedIndex?: number | null } | undefined;
      if (state?.screen) setScreen(state.screen);
      setQuestionIndex(state?.questionIndex ?? 0);
      setSelectedIndex(state?.selectedIndex ?? null);
    });
  }, [resume]);

  useEffect(() => {
    if (screen === 'intro') return;
    void saveModuleDraft({
      moduleId: 'reality',
      title: 'My Reality',
      route: '/reality-flow',
      step: questionIndex,
      totalSteps: TOTAL_QUESTIONS,
      state: { screen, questionIndex, selectedIndex },
    });
  }, [questionIndex, screen, selectedIndex]);

  const exit = () => (router.canGoBack() ? router.back() : router.replace('/library'));

  const handleStart = () => {
    setQuestionIndex(0);
    setSelectedIndex(null);
    setScreen('quiz');
  };

  const handleSelect = (index: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
  };

  const handleNext = () => {
    if (questionIndex + 1 >= TOTAL_QUESTIONS) {
      setScreen('result');
    } else {
      setQuestionIndex((value) => value + 1);
      setSelectedIndex(null);
    }
  };

  const handleDone = async () => {
    await recordModuleCompletion({ moduleId: 'reality', title: 'My Reality', body: 'Completed the My Reality quiz.' });
    await clearModuleDraft('reality');
    exit();
  };

  const question = REALITY_QUESTIONS[questionIndex];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlowHeader title="My Reality" onBack={exit} onClose={exit} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {screen === 'intro' ? (
          <IntroScreen onStart={handleStart} />
        ) : screen === 'quiz' ? (
          <>
            <ProgressBar current={questionIndex + (selectedIndex !== null ? 1 : 0)} total={TOTAL_QUESTIONS} />
            <QuestionScreen
              question={question}
              selectedIndex={selectedIndex}
              onSelect={handleSelect}
              onNext={handleNext}
              isLast={questionIndex + 1 >= TOTAL_QUESTIONS}
            />
          </>
        ) : (
          <ResultScreen onDone={handleDone} />
        )}
      </ScrollView>
    </View>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.introBlock}>
      <Text style={styles.introEmoji}>👀</Text>
      <Heading style={styles.introTitle}>My Reality</Heading>
      <Text style={styles.introHeading}>How well do you know your feed?</Text>
      <Text style={styles.introSubtitle}>10 quick reality checks. See how much your feed might be leaving out.</Text>
      <Btn label="Start 🚀" onPress={onStart} style={styles.introStart} />
      <Text style={styles.introFootnote}>No score. No judgment. Just the reality check.</Text>
    </View>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{current}/{total}</Text>
    </View>
  );
}

function QuestionScreen({
  question, selectedIndex, onSelect, onNext, isLast,
}: {
  question: RealityQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const badge = TYPE_BADGES[question.type];
  const badgeColors = typeBadgeColors(question.type);
  const answered = selectedIndex !== null;
  const correct = answered && isCorrectAnswer(question, selectedIndex);

  return (
    <View style={styles.questionBlock}>
      {badge ? (
        <View style={[styles.typeBadge, { backgroundColor: badgeColors.bg }]}>
          <Text style={[styles.typeBadgeText, { color: badgeColors.text }]}>{badge.emoji} {badge.label}</Text>
        </View>
      ) : null}

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {question.type === 'mockpost' ? <MockPost /> : null}
      {question.type === 'mockfeed' ? <MockFeed /> : null}
      {question.type === 'numguess' ? <PersonDotStat options={question.options} /> : null}

      {answered ? <FeedbackBanner correct={correct} explanation={question.explanation} source={question.source} /> : null}

      <OptionGrid question={question} selectedIndex={selectedIndex} onSelect={onSelect} />

      {answered ? <Btn label={isLast ? 'See Results ✨' : 'Next →'} onPress={onNext} /> : null}
    </View>
  );
}

function OptionGrid({
  question, selectedIndex, onSelect,
}: {
  question: RealityQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  const answered = selectedIndex !== null;
  const isGrid = question.type === 'truefalse';

  return (
    <View style={isGrid ? styles.optionGridRow : styles.optionStack}>
      {question.options.map((option, index) => {
        const isCorrectOption = index === question.correctIndex;
        const isChosen = index === selectedIndex;

        if (!answered) {
          const palette = OPTION_COLORS[index % OPTION_COLORS.length];
          return (
            <Pressable
              key={option}
              onPress={() => onSelect(index)}
              style={[styles.optionCard, isGrid && styles.optionCardGrid, { backgroundColor: palette.bg }]}>
              <Text style={[styles.optionCardText, { color: palette.text }]}>{option}</Text>
            </Pressable>
          );
        }

        const answeredStyle = isCorrectOption ? styles.optionAnsweredCorrect : isChosen ? styles.optionAnsweredWrong : styles.optionAnsweredMuted;
        const answeredTextStyle = isCorrectOption || isChosen ? styles.optionAnsweredTextOn : styles.optionAnsweredTextMuted;
        return (
          <View key={option} style={[styles.optionCard, isGrid && styles.optionCardGrid, answeredStyle]}>
            <Text style={[styles.optionCardText, answeredTextStyle]}>{option}</Text>
          </View>
        );
      })}
    </View>
  );
}

function FeedbackBanner({ correct, explanation, source }: { correct: boolean; explanation: string; source: string }) {
  return (
    <View style={[styles.feedback, correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
      <Text style={styles.feedbackEmoji}>{correct ? '✅' : '❌'}</Text>
      <View style={styles.feedbackBody}>
        <Heading style={[styles.feedbackHeading, { color: correct ? Palette.accent2_700 : Palette.accent700 }]}>
          {correct ? 'Yep 👀' : 'Not quite 👀'}
        </Heading>
        <Text style={styles.feedbackExplanation}>{explanation}</Text>
        <Text style={styles.feedbackSource}>Source: {source}</Text>
      </View>
    </View>
  );
}

function MockPost() {
  return (
    <View style={styles.mockPost}>
      <View style={styles.mockPostHeader}>
        <View style={styles.mockPostAvatar}><Text style={styles.mockPostAvatarText}>J</Text></View>
        <View>
          <Text style={styles.mockPostHandle}>jess_adventures</Text>
          <Text style={styles.mockPostMeta}>Saturday · 📍 Downtown</Text>
        </View>
      </View>
      <View style={styles.mockPostGrid}>
        {['🥞', '🌅', '🎉', '🍜'].map((emoji, i) => (
          <View key={i} style={styles.mockPostTile}><Text style={styles.mockPostTileEmoji}>{emoji}</Text></View>
        ))}
      </View>
      <View style={styles.mockPostFooter}>
        <Text style={styles.mockPostLikes}>❤️ 847 · 💬 93</Text>
        <Text style={styles.mockPostCaption}><Text style={styles.mockPostHandleInline}>jess_adventures</Text> best weekend ever honestly 🥹✨</Text>
      </View>
    </View>
  );
}

function MockFeed() {
  return (
    <View style={styles.mockFeed}>
      {GYM_POSTS.map((post) => (
        <View key={post.user} style={styles.mockFeedRow}>
          <View style={styles.mockFeedThumb}><Text style={styles.mockFeedThumbEmoji}>{post.emoji}</Text></View>
          <View style={styles.mockFeedBody}>
            <Text style={styles.mockFeedUser}>{post.user}</Text>
            <Text style={styles.mockFeedCaption}>{post.caption}</Text>
            <Text style={styles.mockFeedLikes}>❤️ {post.likes}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function PersonDotStat({ options }: { options: string[] }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statCaption}>Out of every 5 teens:</Text>
      <View style={styles.statGrid}>
        {options.map((option, i) => (
          <View key={option} style={styles.statItem}>
            <View style={styles.statDotRow}>
              {Array.from({ length: 5 }, (_, dotIndex) => (
                <View
                  key={dotIndex}
                  style={[
                    styles.statDot,
                    dotIndex < PERSON_STAT_FILLED[i]
                      ? { backgroundColor: OPTION_COLORS[i % OPTION_COLORS.length].bg }
                      : styles.statDotEmpty,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.statLabel}>{option}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ResultScreen({ onDone }: { onDone: () => void }) {
  return (
    <View style={styles.resultBlock}>
      <Text style={styles.resultEmoji}>✨</Text>
      <Heading style={styles.resultTitle}>Reality Check Complete</Heading>
      <Text style={styles.resultSubtitle}>Here&apos;s what to carry with you:</Text>
      <View style={styles.takeawayList}>
        {TAKEAWAYS.map((item) => (
          <View key={item.text} style={styles.takeawayCard}>
            <Text style={styles.takeawayEmoji}>{item.emoji}</Text>
            <Text style={styles.takeawayText}>{item.text}</Text>
          </View>
        ))}
      </View>
      <Btn label="Done 👋" onPress={onDone} />
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  screen: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, paddingBottom: 40, gap: 16 },

  introBlock: { alignItems: 'center', gap: 10, paddingTop: 40, paddingBottom: 20 },
  introEmoji: { fontSize: 56 },
  introTitle: { fontSize: 30, color: Palette.text },
  introHeading: { fontSize: 18, fontWeight: '700', color: Palette.text, textAlign: 'center' },
  introSubtitle: { fontSize: 14, color: Palette.neutral700, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  introStart: { alignSelf: 'stretch' },
  introFootnote: { fontSize: 12, color: Palette.neutral600, marginTop: 10 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: { flex: 1, height: 10, borderRadius: Radius.pill, backgroundColor: Palette.neutral300, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Palette.accent2 },
  progressLabel: { fontSize: 12.5, fontWeight: '700', color: Palette.neutral700 },

  questionBlock: { gap: 12 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingVertical: 5, paddingHorizontal: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  questionCard: { backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 16, boxShadow: Shadow.elevSm },
  questionText: { fontSize: 16, fontWeight: '700', color: Palette.text, lineHeight: 22 },

  optionStack: { gap: 10 },
  optionGridRow: { flexDirection: 'row', gap: 10 },
  optionCard: { borderRadius: Radius.lg, padding: 16, boxShadow: Shadow.elevSm },
  optionCardGrid: { flex: 1, paddingVertical: 28, alignItems: 'center' },
  optionCardText: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  optionAnsweredCorrect: { backgroundColor: '#2F7D5B' },
  optionAnsweredWrong: { backgroundColor: '#B23A4E' },
  optionAnsweredMuted: { backgroundColor: Palette.neutral200 },
  optionAnsweredTextOn: { color: '#FFFFFF' },
  optionAnsweredTextMuted: { color: Palette.neutral600 },

  feedback: { flexDirection: 'row', gap: 10, borderRadius: Radius.lg, padding: 14 },
  feedbackCorrect: { backgroundColor: Palette.accent2_100 },
  feedbackWrong: { backgroundColor: Palette.accent100 },
  feedbackEmoji: { fontSize: 20 },
  feedbackBody: { flex: 1, gap: 4 },
  feedbackHeading: { fontSize: 17 },
  feedbackExplanation: { fontSize: 13.5, color: Palette.text, lineHeight: 19 },
  feedbackSource: { fontSize: 11, color: Palette.neutral600, lineHeight: 15, marginTop: 2 },

  mockPost: { backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, overflow: 'hidden', boxShadow: Shadow.elevSm },
  mockPostHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  mockPostAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Palette.accent2_700, alignItems: 'center', justifyContent: 'center' },
  mockPostAvatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  mockPostHandle: { fontSize: 12, fontWeight: '700', color: Palette.text },
  mockPostHandleInline: { fontWeight: '700', color: Palette.text },
  mockPostMeta: { fontSize: 10, color: Palette.neutral600 },
  mockPostGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  mockPostTile: { width: '50%', aspectRatio: 1.6, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.neutral200 },
  mockPostTileEmoji: { fontSize: 28 },
  mockPostFooter: { padding: 10, gap: 4 },
  mockPostLikes: { fontSize: 11, color: Palette.neutral600 },
  mockPostCaption: { fontSize: 12, color: Palette.text, lineHeight: 17 },

  mockFeed: { gap: 8 },
  mockFeedRow: { flexDirection: 'row', gap: 10, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 10, boxShadow: Shadow.elevSm },
  mockFeedThumb: { width: 52, height: 48, borderRadius: Radius.sm, backgroundColor: Palette.neutral200, alignItems: 'center', justifyContent: 'center' },
  mockFeedThumbEmoji: { fontSize: 22 },
  mockFeedBody: { flex: 1, gap: 2, justifyContent: 'center' },
  mockFeedUser: { fontSize: 12, fontWeight: '700', color: Palette.text },
  mockFeedCaption: { fontSize: 12, color: Palette.neutral700, lineHeight: 16 },
  mockFeedLikes: { fontSize: 10.5, color: Palette.neutral600 },

  statCard: { backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 14, gap: 10, boxShadow: Shadow.elevSm },
  statCaption: { fontSize: 11, fontWeight: '700', color: Palette.neutral600, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { width: '47%', alignItems: 'center', gap: 6 },
  statDotRow: { flexDirection: 'row', gap: 3 },
  statDot: { width: 10, height: 10, borderRadius: 5 },
  statDotEmpty: { backgroundColor: Palette.neutral300 },
  statLabel: { fontSize: 11, fontWeight: '600', color: Palette.neutral700, textAlign: 'center' },

  resultBlock: { alignItems: 'center', gap: 10, paddingTop: 24, paddingBottom: 10 },
  resultEmoji: { fontSize: 44 },
  resultTitle: { fontSize: 26, color: Palette.text, textAlign: 'center' },
  resultSubtitle: { fontSize: 14, color: Palette.neutral700, marginBottom: 6 },
  takeawayList: { gap: 10, alignSelf: 'stretch', marginBottom: 10 },
  takeawayCard: { flexDirection: 'row', gap: 10, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 14, boxShadow: Shadow.elevSm },
  takeawayEmoji: { fontSize: 20 },
  takeawayText: { flex: 1, fontSize: 14, fontWeight: '600', color: Palette.text, lineHeight: 19 },
}));
