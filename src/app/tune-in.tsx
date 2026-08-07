import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ReactNode, useState } from 'react';
import {
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
  ScaleInput,
  SingleSelect,
  TextField,
} from '@/components/survey';
import { Btn, Heading } from '@/components/ui';
import { Palette, Radius } from '@/constants/tokens';

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

const NEXT_CHOICES = [
  'Practice a skill',
  'Talk to someone',
  'Take a break',
  'Set the phone down',
];

type Answers = {
  mood: number | null;
  compared: string | null;
  clarifier: string | null;
  kind: string | null;
  affect: string | null;
  reflection: string;
  platform: string | null;
  platformOther: string;
  intensity: number | null;
  domains: string[];
  domainOther: string;
  doing: string[];
  triggerText: string;
  target: string[];
  jThoughts: string;
  jIntensity: number | null;
  jAfter: string;
  jNext: string[];
};

const INITIAL: Answers = {
  mood: null,
  compared: null,
  clarifier: null,
  kind: null,
  affect: null,
  reflection: '',
  platform: null,
  platformOther: '',
  intensity: null,
  domains: [],
  domainOther: '',
  doing: [],
  triggerText: '',
  target: [],
  jThoughts: '',
  jIntensity: null,
  jAfter: '',
  jNext: [],
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
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(INITIAL);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setA((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: 'domains' | 'doing' | 'target' | 'jNext', value: string) =>
    setA((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });

  const close = () => router.back();

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
              'I had something someone else wanted',
              'We seemed about the same',
            ]}
            value={a.kind}
            onChange={(v) => set('kind', v)}
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
            onChange={(v) => set('affect', v)}
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
      canContinue: !!a.platform && (a.platform !== 'Other' || a.platformOther.trim().length > 0),
      content: (
        <>
          <QuestionHeader
            title="What app were you using?"
            subtitle="When you compared yourself to others."
          />
          <SingleSelect options={PLATFORMS} value={a.platform} onChange={(v) => set('platform', v)} />
          {a.platform === 'Other' ? (
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
          <ScaleInput
            points={7}
            value={a.intensity}
            onChange={(v) => set('intensity', v)}
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
      key: 'j-thoughts',
      content: (
        <>
          <QuestionHeader
            kicker="Reflect"
            title="What thoughts and feelings came up after?"
          />
          <TextField
            value={a.jThoughts}
            onChange={(v) => set('jThoughts', v)}
            placeholder="Whatever comes to mind…"
          />
          <Text style={styles.optionalLabel}>Need a word? Tap to add one.</Text>
          <Chips
            items={EMOTION_WORDS}
            onPick={(word) =>
              set('jThoughts', a.jThoughts ? `${a.jThoughts.trim()}, ${word.toLowerCase()}` : word)
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
          <ScaleInput
            points={7}
            value={a.jIntensity}
            onChange={(v) => set('jIntensity', v)}
            minLabel="Barely"
            maxLabel="Very intense"
          />
        </>
      ),
    },
    {
      key: 'j-after',
      content: (
        <>
          <QuestionHeader title="What did you do afterward, if anything?" />
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
      content: (
        <>
          <QuestionHeader title="What would you like to do next?" subtitle="Pick any that feel right." />
          <MultiSelect options={NEXT_CHOICES} values={a.jNext} onToggle={(v) => toggle('jNext', v)} />
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
          <QuestionHeader kicker="Check in" title="How do you feel, Maya?" />
          <ScaleInput
            points={5}
            value={a.mood}
            onChange={(v) => set('mood', v)}
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
        </>
      ),
    },
  ];

  if (a.compared === 'No') {
    steps.push({
      key: 'practice-offer',
      terminal: true,
      content: (
        <View style={styles.terminal}>
          <View style={styles.doneBadge}>
            <Ionicons name="leaf-outline" size={30} color={Palette.accent2_700} />
          </View>
          <Heading style={styles.doneTitle}>Great — that&apos;s worth noting.</Heading>
          <Text style={styles.doneBody}>
            Want to take two minutes to practice your skills while things feel steady?
          </Text>
          <View style={styles.terminalActions}>
            <Btn label="Practice for 2 min" onPress={close} />
            <Btn variant="ghost" label="Not now" onPress={close} />
          </View>
        </View>
      ),
    });
  } else if (a.compared) {
    if (a.compared === 'Not sure') {
      steps.push({
        key: 'clarifier',
        canContinue: !!a.clarifier,
        content: (
          <>
            <QuestionHeader
              kicker="No pressure"
              title="Did anything you saw leave you feeling more or less than someone else?"
              subtitle="Even a small tug counts — this helps us figure it out together."
            />
            <SingleSelect
              options={['Yeah, a little', 'Not really', 'Still not sure']}
              value={a.clarifier}
              onChange={(v) => set('clarifier', v)}
            />
          </>
        ),
      });
    }
    steps.push(...mainSteps);
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
            <Btn label="Done" onPress={close} />
          </View>
        </View>
      ),
    });
  }

  const current = steps[Math.min(step, steps.length - 1)];
  const isLast = step >= steps.length - 1;
  const progress = (step + 1) / steps.length;

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
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
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
          {current.content}
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
    borderRadius: Radius.pill,
    backgroundColor: Palette.neutral300,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Palette.accent2 },
  body: { padding: 20, gap: 18 },
  optionalLabel: { fontSize: 12.5, color: Palette.neutral700, marginTop: 2 },
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
