import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Heading } from '@/components/ui';
import { Palette, Radius , themedStyleSheet } from '@/constants/tokens';
import { clearModuleDraft, getModuleDraft, recordModuleCompletion, saveModuleDraft } from '@/data/module-history';

const thought = '"Maybe they like each other more than me."';
const checks = [
  'What would you say to a friend who was having this thought?',
  'Are you assuming the worst?',
  'If you were being kind to yourself, what might you say?',
  'Is this thought helping you manage tough feelings and meet your goals?',
  'How else might you think about the situation?',
];

export default function LibraryFlowScreen() {
  const router = useRouter();
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [responses, setResponses] = useState<string[]>(checks.map(() => ''));
  const [belief, setBelief] = useState<number | null>(null);
  const [helpful, setHelpful] = useState<number | null>(null);

  useEffect(() => {
    if (resume !== '1') return;
    void getModuleDraft().then((draft) => {
      if (!draft || draft.moduleId !== 'thoughts') return;
      setStep(draft.step);
      const state = draft.state as { answer?: string | null; responses?: string[]; belief?: number | null; helpful?: number | null } | undefined;
      if (state) {
        setAnswer(state.answer ?? null);
        setResponses(state.responses ?? checks.map(() => ''));
        setBelief(state.belief ?? null);
        setHelpful(state.helpful ?? null);
      }
    });
  }, [resume]);

  const canContinue = step === 0 ? !!answer : step === 1 ? true : !!belief && !!helpful;
  const next = () => setStep((value) => Math.min(value + 1, 2));
  useEffect(() => {
    if (step > 0 || answer || responses.some(Boolean) || belief || helpful) {
      void saveModuleDraft({ moduleId: 'thoughts', title: 'My Thoughts', route: '/library-flow', step, totalSteps: 3, state: { answer, responses, belief, helpful } });
    }
  }, [answer, belief, helpful, responses, step]);

  const finish = async () => {
    await recordModuleCompletion({
      moduleId: 'thoughts',
      title: 'My Thoughts',
      body: responses.find((response) => response.trim()) || 'Looked at a difficult thought another way.',
    });
    await clearModuleDraft('thoughts');
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => (step ? setStep(step - 1) : router.back())} hitSlop={10}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Heading style={styles.headerTitle}>My Thoughts</Heading>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.close}>×</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 ? (
          <>
            <View style={styles.illustration}>
              <Text style={styles.star}>✦</Text><Text style={styles.moon}>◐</Text><Text style={styles.sparkle}>✧</Text>
            </View>
            <View style={styles.summary}>
              <Text style={styles.body}>You said that seeing your friends hanging out without you made you feel left out, and you were thinking, <Text style={styles.strong}>{thought}</Text></Text>
            </View>
            <View style={styles.questionBlock}>
              <Heading style={styles.question}>Did we get that right?</Heading>
              <View style={styles.options}>{['Yes', 'Kind of', 'Not really'].map((option) => (
                <Pressable key={option} onPress={() => setAnswer(option)} style={[styles.option, answer === option && styles.optionSelected]}>
                  <Text style={[styles.optionText, answer === option && styles.optionTextSelected]}>{option}</Text>
                </Pressable>
              ))}</View>
              <Text style={styles.explanation}>We&apos;ll call this your <Text style={styles.emphasis}>hot thought</Text>, the thought that felt most upsetting or distressing in that moment.</Text>
            </View>
          </>
        ) : step === 1 ? (
          <>
            <Text style={styles.kicker}>DON&apos;T GET STUCK</Text>
            <Text style={styles.body}>Sometimes a hot thought feels really true in the moment, but might seem a bit extreme or not make as much sense when you look at it up close. We want to hold on to the thoughts that help us manage tough emotions and meet our goals and not get stuck on the ones that don&apos;t. To start, ask yourself the following questions. You can answer as many or as few as you want:</Text>
            <Text style={styles.kicker}>HOT THOUGHT</Text>
            <View style={styles.summary}><Text style={styles.body}>{thought}</Text></View>
            {checks.map((label, index) => <View key={label} style={styles.fieldGroup}><Text style={styles.label}>{label}</Text><TextInput value={responses[index]} onChangeText={(value) => setResponses((old) => old.map((item, i) => i === index ? value : item))} placeholder="Your response…" placeholderTextColor={Palette.neutral600} multiline style={styles.input} /></View>)}
          </>
        ) : (
          <>
            <Text style={styles.kicker}>ORIGINAL HOT THOUGHT</Text><View style={styles.summary}><Text style={styles.body}>{thought}</Text></View>
            <Text style={styles.kicker}>HELPFUL, BALANCED THOUGHT</Text><View style={styles.summary}><Text style={styles.muted}>Nothing written yet</Text></View>
            <Text style={styles.kicker}>RE-RATE HOT THOUGHT</Text><Text style={styles.body}>Now that you&apos;ve looked at it another way, how much do you believe this earlier thought?</Text><Text style={styles.body}>{thought}</Text>
            <Scale value={belief} onChange={setBelief} min="Don&apos;t believe it" max="Completely true" />
            <Text style={styles.kicker}>HOW HELPFUL IS THIS NEW THOUGHT?</Text><Text style={styles.body}>How helpful is this new thought?</Text><View style={styles.summary}><Text style={styles.muted}>Nothing written yet</Text></View>
            <Scale value={helpful} onChange={setHelpful} min="Not helpful" max="Really helpful" />
            <Text style={styles.source}>Adapted from Back from the Bluez: Module 6 – Detective Work and Disputation, Centre for Clinical Interventions (CCI), Government of Western Australia.</Text>
          </>
        )}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Btn label={step === 2 ? 'Add to My Library!' : 'Continue'} disabled={!canContinue} onPress={step === 2 ? finish : next} style={!canContinue ? styles.disabled : undefined} />
      </View>
    </View>
  );
}

function Scale({ value, onChange, min, max }: { value: number | null; onChange: (value: number) => void; min: string; max: string }) {
  return <View style={styles.scale}><View style={styles.scaleRow}>{[1, 2, 3, 4, 5, 6, 7].map((number) => <Pressable key={number} onPress={() => onChange(number)} style={[styles.scaleItem, value === number && styles.scaleSelected]}><Text style={[styles.scaleText, value === number && styles.scaleTextSelected]}>{number}</Text></Pressable>)}</View><View style={styles.scaleLabels}><Text style={styles.muted}>{min}</Text><Text style={styles.muted}>{max}</Text></View></View>;
}

const styles = themedStyleSheet(() => ({
  screen: { flex: 1, backgroundColor: Palette.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  back: { color: Palette.neutral700, fontSize: 34, lineHeight: 28 }, close: { color: Palette.neutral700, fontSize: 30, lineHeight: 28 }, headerTitle: { fontSize: 20, color: Palette.text },
  content: { padding: 20, gap: 18, paddingBottom: 40 },
  illustration: { height: 130, borderRadius: Radius.xl, backgroundColor: Palette.accent2_100, alignItems: 'center', justifyContent: 'center' }, star: { position: 'absolute', top: 18, left: 45, fontSize: 26, color: Palette.accent700 }, moon: { fontSize: 72, color: Palette.accent2_700 }, sparkle: { position: 'absolute', right: 48, bottom: 18, fontSize: 30, color: Palette.accent },
  summary: { backgroundColor: Palette.neutral200, borderRadius: Radius.lg, padding: 16, borderWidth: 1, borderColor: Palette.accent2_200 }, body: { fontSize: 15, lineHeight: 23, color: Palette.text }, strong: { fontWeight: '700' }, muted: { color: Palette.neutral700, fontSize: 14, lineHeight: 20 }, kicker: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700', letterSpacing: 0.7 }, questionBlock: { gap: 14 }, question: { fontSize: 22, lineHeight: 28, color: Palette.text }, options: { flexDirection: 'row', gap: 8 }, option: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: Radius.sm, borderWidth: 1, borderColor: Palette.neutral300, backgroundColor: Palette.neutral100 }, optionSelected: { borderColor: Palette.accent2_700, backgroundColor: Palette.accent2_100 }, optionText: { fontSize: 13, fontWeight: '700', color: Palette.text }, optionTextSelected: { color: Palette.accent2_800 }, explanation: { fontSize: 15, lineHeight: 23, color: Palette.text }, emphasis: { fontWeight: '700', fontStyle: 'italic' }, fieldGroup: { gap: 8 }, label: { fontSize: 14, lineHeight: 20, color: Palette.text, fontWeight: '600' }, input: { minHeight: 68, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, backgroundColor: Palette.neutral100, padding: 12, color: Palette.text, textAlignVertical: 'top' }, scale: { gap: 8 }, scaleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 }, scaleItem: { flex: 1, aspectRatio: 1, maxWidth: 48, borderRadius: Radius.pill, borderWidth: 1, borderColor: Palette.neutral300, backgroundColor: Palette.neutral100, alignItems: 'center', justifyContent: 'center' }, scaleSelected: { backgroundColor: Palette.accent2, borderColor: Palette.accent2 }, scaleText: { color: Palette.text, fontWeight: '700' }, scaleTextSelected: { color: Palette.bg }, scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' }, source: { color: Palette.neutral600, fontSize: 11, lineHeight: 16 }, footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: Palette.neutral300 }, disabled: { opacity: 0.35 },
}));
