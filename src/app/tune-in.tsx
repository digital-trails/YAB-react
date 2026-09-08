import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Chips,
  InfoNote,
  MultiSelect,
  QuestionHeader,
  RatingSlider,
  ScaleInput,
  SingleSelect,
  TextField,
} from '@/components/survey';
import { Btn, Heading } from '@/components/ui';
import { Palette } from '@/constants/tokens';
import { clearModuleDraft, getModuleDraft, recordModuleCompletion, saveModuleDraft } from '@/data/module-history';

const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];

const PLATFORMS = [
  'Instagram',
  'TikTok',
  'Snapchat',
  'Messages/iMessage',
  'WhatsApp',
  'Facebook',
  'YouTube',
  'Reddit',
  'X/Twitter',
  'Discord',
  'Other',
];

const DOMAINS = [
  'Academic/Work',
  'Relationships/Social Life',
  'Friends',
  'Family',
  'Fitness/Body/Weight',
  'Nutrition/Food',
  'Fashion/Style',
  'Lifestyle',
  'Money',
  'Mental Health',
  'Hobbies/Interests',
  'Travel',
  'Appearance',
  'Accomplishments',
  'Something else',
];

const DOING = [
  'Scrolling or viewing content',
  'Posting content',
  'Commenting or reacting',
  'Messaging someone',
  'Searching for something',
  'Other',
];

const TARGETS = [
  'Close friends or family',
  'Peers/acquaintances',
  'Influencers/creators/strangers',
  'Meme accounts',
  'News accounts',
  'Other',
];

const EMOTION_WORDS = [
  'Envious',
  'Not enough',
  'Left out',
  'Frustrated',
  'Ashamed',
  'Inspired',
  'Motivated',
  'Sad',
];

const NEXT_CHOICES = ['Practice a skill', 'Something else'];
const NEXT_IDEAS = ['Talk to someone', 'Put the phone away', 'Take a break from scrolling'];

type Answers = {
  mood: number | null;
  compared: string | null;
  clarifier: string | null;
  relative: string | null;
  kind: string | null;
  affect: string | null;
  reflection: string;
  platforms: string[];
  platformOther: string;
  intensity: number | null;
  domains: string[];
  domainOther: string;
  doing: string[];
  triggerText: string;
  target: string[];
  jFeelings: string;
  jIntensity: number | null;
  jThoughts: string;
  jAfter: string;
  jNextChoice: string | null;
  jNext: string;
};

const INITIAL: Answers = {
  mood: null,
  compared: null,
  clarifier: null,
  relative: null,
  kind: null,
  affect: null,
  reflection: '',
  platforms: [],
  platformOther: '',
  intensity: 50,
  domains: [],
  domainOther: '',
  doing: [],
  triggerText: '',
  target: [],
  jFeelings: '',
  jIntensity: 50,
  jThoughts: '',
  jAfter: '',
  jNextChoice: null,
  jNext: '',
};

type Step = {
  key: string;
  content: ReactNode;
  canContinue?: boolean;
  /** Terminal steps supply their own actions and hide the Back/Continue nav. */
  terminal?: boolean;
};

export default function TuneInSurvey() {
  const router = useRouter();
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(INITIAL);
  const [showNextIdeas, setShowNextIdeas] = useState(false);

  useEffect(() => {
    if (resume !== '1') return;
    void getModuleDraft().then((draft) => {
      if (!draft || draft.moduleId !== 'tune-in') return;
      setStep(draft.step);
      if (draft.state) setA(draft.state as Answers);
    });
  }, [resume]);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setA((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: 'platforms' | 'domains' | 'doing' | 'target', value: string) =>
    setA((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });

  const close = () => router.back();
  const finish = async () => {
    await recordModuleCompletion({
      moduleId: 'tune-in',
      title: 'Comparison Check',
      body: a.reflection.trim() || (a.affect ? `Felt ${a.affect.toLowerCase()} after comparing.` : undefined),
      metadata: {
        mood: a.mood ?? 3,
        compared: a.compared === 'Yes' || a.clarifier === 'Yes' || a.clarifier === 'Maybe' ? 1 : 0,
        affect: a.affect ?? '',
        platform: a.platforms[0] ?? '',
        intensity: a.intensity ?? 50,
        domains: a.domains.join('|'),
        doing: a.doing.join('|'),
        target: a.target.join('|'),
        hour: new Date().getHours(),
      },
    });
    await clearModuleDraft('tune-in');
    close();
  };
  const saveDraft = () => saveModuleDraft({ moduleId: 'tune-in', title: 'Comparison Check', route: '/tune-in', step, totalSteps: steps.length, state: a });
  const previousStep = useRef(step);
  const [questionOpacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    questionOpacity.setValue(0);
    Animated.timing(questionOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [questionOpacity, step]);

  // The full set of questions when a comparison did (or might have) happened.
  const mainSteps: Step[] = [
    {
      key: 'kind',
      canContinue: !!a.kind,
      content: (
        <>
          <QuestionHeader
            kicker="The comparison"
            title="Which best describes the comparison?"
            subtitle="Think about the one that impacted you the most today."
          />
          <SingleSelect
            options={[
              'Someone had something I wanted',
              "I had something the other person didn’t.",
              'We seemed about the same',
            ]}
            value={a.kind}
            onChange={(v) => {
              set('kind', v);
            }}
          />
        </>
      ),
    },
    {
      key: 'affect',
      canContinue: !!a.affect,
      content: (
        <>
          <QuestionHeader title="How did you feel about yourself?" />
          <SingleSelect
            options={['Better', 'Worse', 'No different']}
            value={a.affect}
            onChange={(v) => {
              set('affect', v);
            }}
          />
          <Text style={styles.optionalLabel}>Optional — why do you think it made you feel that way?</Text>
          <TextField
            value={a.reflection}
            onChange={(v) => set('reflection', v)}
            placeholder="A sentence or two, if you'd like…"
          />
        </>
      ),
    },
    {
      key: 'platform',
      canContinue: a.platforms.length > 0 && (!a.platforms.includes('Other') || a.platformOther.trim().length > 0),
      content: (
        <>
          <QuestionHeader
            title="What apps were you using?"
            subtitle="Select all that apply."
          />
          <MultiSelect options={PLATFORMS} values={a.platforms} onToggle={(v) => toggle('platforms', v)} />
          {a.platforms.includes('Other') ? (
            <TextField
              value={a.platformOther}
              onChange={(v) => set('platformOther', v)}
              placeholder="Which app?"
            />
          ) : null}
        </>
      ),
    },
    {
      key: 'intensity',
      canContinue: a.intensity !== null,
      content: (
        <>
          <QuestionHeader
            title="When the feeling was strongest, how did the comparison feel?"
          />
          <RatingSlider
            value={a.intensity ?? 50}
            onChange={(v) => set('intensity', v)}
            minEmoji="😊"
            maxEmoji="😔"
            minLabel="Very positive"
            maxLabel="Very negative"
          />
        </>
      ),
    },
    {
      key: 'domains',
      canContinue: a.domains.length > 0,
      content: (
        <>
          <QuestionHeader
            title="What was the comparison about?"
            subtitle="Select all that apply."
          />
          <MultiSelect options={DOMAINS} values={a.domains} onToggle={(v) => toggle('domains', v)} />
          {a.domains.includes('Something else') ? (
            <TextField
              value={a.domainOther}
              onChange={(v) => set('domainOther', v)}
              placeholder="Something else…"
            />
          ) : null}
        </>
      ),
    },
    {
      key: 'trigger',
      canContinue: a.doing.length > 0,
      content: (
        <>
          <QuestionHeader
            title="What were you doing on the app?"
            subtitle="Select all that apply."
          />
          <MultiSelect options={DOING} values={a.doing} onToggle={(v) => toggle('doing', v)} />
          <Text style={styles.optionalLabel}>What do you think triggered the comparison?</Text>
          <TextField
            value={a.triggerText}
            onChange={(v) => set('triggerText', v)}
            placeholder="Optional…"
          />
        </>
      ),
    },
    {
      key: 'target',
      canContinue: a.target.length > 0,
      content: (
        <>
          <QuestionHeader
            title="Who were you mainly viewing online?"
            subtitle="Select all that apply."
          />
          <MultiSelect options={TARGETS} values={a.target} onToggle={(v) => toggle('target', v)} />
        </>
      ),
    },
    {
      key: 'j-feelings',
      content: (
        <>
          <QuestionHeader
            kicker="Reflect"
            title="What feelings came up after the comparison?"
          />
          <TextField
            value={a.jFeelings}
            onChange={(v) => set('jFeelings', v)}
            placeholder="Whatever comes to mind…"
          />
          <Text style={styles.optionalLabel}>Need a word? Tap to add one.</Text>
          <Chips
            items={EMOTION_WORDS}
            onPick={(word) =>
              set('jFeelings', a.jFeelings ? `${a.jFeelings.trim()}, ${word.toLowerCase()}` : word)
            }
          />
        </>
      ),
    },
    {
      key: 'j-intensity',
      canContinue: a.jIntensity !== null,
      content: (
        <>
          <QuestionHeader title="How intense were those feelings?" />
          <RatingSlider
            value={a.jIntensity ?? 50}
            onChange={(v) => set('jIntensity', v)}
            minEmoji="😌"
            maxEmoji="😰"
            minLabel="Not at all"
            maxLabel="Very much"
          />
        </>
      ),
    },
    {
      key: 'j-thoughts',
      content: (
        <>
          <QuestionHeader title="What thoughts came up tied to the comparison?" />
          <TextField
            value={a.jThoughts}
            onChange={(v) => set('jThoughts', v)}
            placeholder="Whatever comes to mind…"
          />
        </>
      ),
    },
    {
      key: 'j-after',
      content: (
        <>
          <QuestionHeader title="What did you do afterward to respond to the comparison, if anything?" />
          <TextField
            value={a.jAfter}
            onChange={(v) => set('jAfter', v)}
            placeholder="Optional…"
          />
        </>
      ),
    },
    {
      key: 'j-next',
      canContinue: a.jNextChoice === 'Practice a skill' || (a.jNextChoice === 'Something else' && a.jNext.trim().length > 0),
      content: (
        <>
          <QuestionHeader title="What would you like to do next?" />
          <SingleSelect
            options={NEXT_CHOICES}
            value={a.jNextChoice}
            onChange={(v) => {
              setShowNextIdeas(false);
              set('jNextChoice', v);
              if (v === 'Practice a skill') set('jNext', '');
            }}
          />
          {a.jNextChoice === 'Something else' ? (
            <View style={styles.nextDetails}>
              <TextField
                value={a.jNext}
                onChange={(v) => set('jNext', v)}
                placeholder="What would you like to do?"
              />
              <Btn
                label="Need an idea?"
                variant="ghost"
                onPress={() => setShowNextIdeas((shown) => !shown)}
              />
              {showNextIdeas ? (
                <View style={styles.ideaList}>
                  {NEXT_IDEAS.map((idea) => (
                    <Pressable
                      key={idea}
                      onPress={() => set('jNext', idea)}
                      style={[styles.idea, a.jNext === idea && styles.ideaOn]}>
                      <Text style={styles.ideaText}>{idea}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      ),
    },
  ];

  // Assemble the step list, branching on the comparison answer.
  const steps: Step[] = [
    {
      key: 'mood',
      canContinue: a.mood !== null,
      content: (
        <>
          <QuestionHeader kicker="Check in" title="How do you feel Maya?" />
          <ScaleInput
            points={5}
            value={a.mood}
            onChange={(v) => {
              set('mood', v);
            }}
            emojis={MOOD_EMOJIS}
            minLabel="Very bad"
            maxLabel="Very good"
          />
        </>
      ),
    },
    {
      key: 'compared',
      canContinue: !!a.compared,
      content: (
        <>
          <QuestionHeader title="Did you compare yourself to others on social media today?" />
          <InfoNote>
            Social comparison is measuring yourself against someone else — their looks, wins,
            or life. It&apos;s normal, and noticing it is the first skill.
          </InfoNote>
          <SingleSelect
            options={['Yes', 'No', 'Not sure']}
            value={a.compared}
            onChange={(v) => set('compared', v)}
          />
          {a.compared === 'Not sure' ? (
            <View style={styles.inlineFollowUp}>
              <QuestionHeader
                kicker="No pressure"
                title="Did something you saw make you think about how you were doing, looking, feeling, or living compared with someone else?"
                subtitle="It&apos;s okay if you&apos;re still figuring it out."
              />
              <SingleSelect
                options={['Yes', 'Maybe', 'No', 'Still not sure']}
                value={a.clarifier}
                onChange={(v) => set('clarifier', v)}
              />
              {a.clarifier === 'Maybe' ? (
                <View style={styles.inlineFollowUp}>
                  <QuestionHeader title="Did you feel like you had more, less, or about the same as the other person?" />
                  <SingleSelect
                    options={['More', 'Less', 'About the same']}
                    value={a.relative}
                    onChange={(v) => {
                      set('relative', v);
                    }}
                  />
                </View>
              ) : null}
            </View>
          ) : null}
        </>
      ),
    },
  ];

  if (
    a.compared === 'No' ||
    (a.compared === 'Not sure' && (a.clarifier === 'No' || a.clarifier === 'Still not sure'))
  ) {
    // A Not sure → No/Still not sure answer gets a low-pressure, graceful exit.
    steps.push({
      key: 'practice-offer',
      terminal: true,
      content: (
        <View style={styles.terminal}>
          <View style={styles.doneBadge}>
            <Ionicons name="leaf-outline" size={30} color={Palette.accent2_700} />
          </View>
          <Heading style={styles.doneTitle}>
            {a.compared === 'Not sure' && a.clarifier === 'Still not sure'
              ? "That's okay."
              : "Great — that's worth noting."}
          </Heading>
          <Text style={styles.doneBody}>
            {a.compared === 'Not sure' && a.clarifier === 'Still not sure'
              ? "Sometimes it's hard to tell. We'll just note that and keep going."
              : "Want to take two minutes to practice your skills while things feel steady?"}
          </Text>
          <View style={styles.terminalActions}>
            <Btn label="Practice for 2 min" onPress={close} />
            <Btn variant="ghost" label="Not now" onPress={close} />
          </View>
        </View>
      ),
    });
  } else if (a.compared === 'Yes' || (a.compared === 'Not sure' && (a.clarifier === 'Yes' || a.clarifier === 'Maybe'))) {
    // The Not sure clarification is rendered inline on the comparison page.
    // Once it resolves to Yes/Maybe, continue into the detailed pathway.
    steps.push(...(a.compared === 'Not sure' && a.clarifier === 'Maybe' ? mainSteps.slice(1) : mainSteps));
    steps.push({
      key: 'complete',
      terminal: true,
      content: (
        <View style={styles.terminal}>
          <View style={styles.doneBadge}>
            <Ionicons name="checkmark" size={32} color={Palette.accent2_700} />
          </View>
          <Heading style={styles.doneTitle}>Nice work tuning in.</Heading>
          <Text style={styles.doneBody}>
            Naming a comparison as it happens takes the sting out of it. This entry is saved to your
            week.
          </Text>
          <View style={styles.terminalActions}>
            <Btn label="Done" onPress={finish} />
          </View>
        </View>
      ),
    });
  }

  useEffect(() => {
    if (step > 0 || a.mood !== null || a.compared !== null) void saveDraft();
  }, [a.compared, a.mood, step]);

  const current = steps[Math.min(step, steps.length - 1)];
  const isLast = step >= steps.length - 1;
  const inBranch = a.compared === 'Yes' || (a.compared === 'Not sure' && (a.clarifier === 'Yes' || a.clarifier === 'Maybe'));
  const progressStart = 2;
  const progress = inBranch
    ? Math.min(1, Math.max(0, (step + 1 - progressStart) / Math.max(1, steps.length - progressStart - 1)))
    : 0;

  const goBack = () => (step > 0 ? setStep(step - 1) : close());
  const goNext = () => {
    if (!isLast) setStep(step + 1);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header: back / progress / close */}
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={22} color={Palette.neutral700} />
        </Pressable>
        {inBranch ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        ) : (
          <View style={styles.flex} />
        )}
        <Pressable onPress={close} hitSlop={10} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color={Palette.neutral700} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: questionOpacity }}>
            {current.content}
          </Animated.View>
        </ScrollView>

        {!current.terminal ? (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <Btn
              label={isLast ? 'Finish' : 'Continue'}
              disabled={current.canContinue === false}
              onPress={goNext}
              style={current.canContinue === false ? styles.btnDisabled : undefined}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: { padding: 2 },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: Palette.neutral300,
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Palette.accent2 },
  body: { padding: 20, gap: 18 },
  inlineFollowUp: {
    gap: 14,
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: Palette.neutral300,
  },
  optionalLabel: { fontSize: 12.5, color: Palette.neutral700, marginTop: 2 },
  scaleHint: { fontSize: 12.5, color: Palette.neutral700, lineHeight: 18 },
  nextDetails: { gap: 10, marginTop: 4 },
  ideaList: { gap: 8 },
  idea: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.neutral300,
    backgroundColor: '#FCF7EE',
  },
  ideaOn: { borderColor: Palette.accent2, backgroundColor: Palette.accent2_100 },
  ideaText: { fontSize: 14, color: Palette.text },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Palette.neutral300,
  },
  btnDisabled: { opacity: 0.45 },

  terminal: { alignItems: 'center', gap: 14, paddingTop: 40 },
  doneBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Palette.accent2_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { fontSize: 24, color: Palette.text, textAlign: 'center' },
  doneBody: { fontSize: 14, color: Palette.neutral700, textAlign: 'center', lineHeight: 21 },
  terminalActions: { alignSelf: 'stretch', gap: 10, marginTop: 12 },
});
