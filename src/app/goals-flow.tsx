import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, FlowHeader, Heading } from '@/components/ui';
import { Palette, Radius, Shadow, themedStyleSheet } from '@/constants/tokens';
import { clearModuleDraft, getModuleDraft, recordModuleCompletion, saveModuleDraft } from '@/data/module-history';
import {
  getDoabilityOptions, getOtherPatternOption, getPatternBarCards,
  getReflectionPrompt, getStarterPrompts, type PatternBarCard as PatternBarCardData,
} from '@/data/patterns-data';

const values = ['Connection', 'Being Yourself', 'Growth', 'Achievement', 'Health & Well-Being', 'Creativity', 'Independence', 'Kindness', 'Fun', 'Something Else'];

export default function GoalsFlowScreen() {
  const router = useRouter();
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<'home' | 'values' | 'patterns'>('home');
  const [step, setStep] = useState(0);
  const [value, setValue] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [workOnText, setWorkOnText] = useState('');
  const [smallStepText, setSmallStepText] = useState('');
  const [doabilityRating, setDoabilityRating] = useState<string | null>(null);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const maxStep = 3;

  useEffect(() => {
    if (resume !== '1') return;
    void getModuleDraft().then((draft) => {
      if (!draft || draft.moduleId !== 'goals') return;
      const state = draft.state as {
        page?: 'values' | 'patterns'; value?: string | null; text?: string;
        selectedPatternId?: string | null; workOnText?: string; smallStepText?: string; doabilityRating?: string | null;
        reflectionNotes?: string;
      } | undefined;
      setStep(draft.step);
      if (state?.page) setPage(state.page);
      if (state) {
        setValue(state.value ?? null); setText(state.text ?? '');
        setSelectedPatternId(state.selectedPatternId ?? null);
        setWorkOnText(state.workOnText ?? ''); setSmallStepText(state.smallStepText ?? '');
        setDoabilityRating(state.doabilityRating ?? null);
        setReflectionNotes(state.reflectionNotes ?? '');
      }
    });
  }, [resume]);

  const exit = () => (router.canGoBack() ? router.back() : router.replace('/library'));
  const next = () => setStep((current) => current + 1);
  useEffect(() => {
    if (page !== 'home') void saveModuleDraft({
      moduleId: 'goals', title: page === 'values' ? 'My Values' : 'My Patterns', route: '/goals-flow', step, totalSteps: maxStep + 1,
      state: { page, value, text, selectedPatternId, workOnText, smallStepText, doabilityRating, reflectionNotes },
    });
  }, [doabilityRating, page, reflectionNotes, selectedPatternId, smallStepText, step, text, value, workOnText]);

  const finish = async () => {
    if (page === 'values') {
      await recordModuleCompletion({
        moduleId: 'values',
        title: 'My Values',
        body: `${value ?? 'A new goal'}${text ? ` · ${text}` : ''}`,
      });
    } else {
      const selectedCard = [...getPatternBarCards(), getOtherPatternOption()].find((card) => card.id === selectedPatternId);
      const showReflection = doabilityRating === 'A little hard' || doabilityRating === "I'm not sure";
      const body = `${selectedCard?.title ?? 'A new pattern'}`
        + `${workOnText ? ` · Working on: ${workOnText}` : ''}`
        + `${smallStepText ? ` · Small step: ${smallStepText}` : ''}`
        + `${reflectionNotes ? ` · Reflection: ${reflectionNotes}` : ''}`;
      await recordModuleCompletion({
        moduleId: 'patterns',
        title: 'My Patterns',
        body,
        metadata: {
          selectedPatternId: selectedPatternId ?? '',
          selectedPatternTitle: selectedCard?.title ?? '',
          workOnText,
          smallStepText,
          doabilityRating: doabilityRating ?? '',
          reflectionPrompt: showReflection ? getReflectionPrompt() : '',
          reflectionNotes,
          isPrivate: true,
        },
      });
    }
    await clearModuleDraft('goals');
    exit();
  };
  const finishWithoutSaving = async () => {
    await clearModuleDraft('goals');
    exit();
  };
  const canContinue = step >= maxStep
    ? (page === 'patterns' ? !!doabilityRating : true)
    : page === 'values'
      ? (step === 0 ? !!value : true)
      : step === 0 ? !!selectedPatternId
      : step === 1 ? !!workOnText.trim()
      : !!smallStepText.trim();
  const continueLabel = step >= maxStep ? 'Finish' : (page === 'patterns' && step === 0 ? 'Next' : 'Continue');
  const tabLabels = page === 'values' ? ['VALUE', 'MOVES', 'PLAN', 'REVIEW'] : ['PATTERNS', 'WORK ON', 'SMALL STEP', 'CHECK-IN'];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlowHeader
        title="✦ My Goals"
        onBack={() => (page === 'home' ? exit() : step ? setStep(step - 1) : setPage('home'))}
        onClose={exit}
      />
      {page === 'home' ? <Home onPick={(nextPage) => { setPage(nextPage); setStep(0); }} /> : (
        <>
          <View style={styles.tabs}>
            {tabLabels.map((label, index) => <Text key={label} style={index === step ? styles.tabOn : undefined}>{label}</Text>)}
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {page === 'values' ? <Values step={step} selected={value} onSelect={setValue} text={text} setText={setText} /> : (
              <Patterns
                step={step} selectedPatternId={selectedPatternId} onSelectPattern={setSelectedPatternId}
                workOnText={workOnText} setWorkOnText={setWorkOnText}
                smallStepText={smallStepText} setSmallStepText={setSmallStepText}
                doabilityRating={doabilityRating} setDoabilityRating={setDoabilityRating}
                reflectionNotes={reflectionNotes} setReflectionNotes={setReflectionNotes}
              />
            )}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            {page === 'patterns' && step >= maxStep ? (
              <>
                <Btn label="Save privately" disabled={!canContinue} onPress={finish} style={!canContinue ? styles.disabled : undefined} />
                <Btn label="Finish" variant="secondary" onPress={finishWithoutSaving} />
              </>
            ) : (
              <Btn label={continueLabel} disabled={!canContinue} onPress={step >= maxStep ? finish : next} style={!canContinue ? styles.disabled : undefined} />
            )}
          </View>
        </>
      )}
    </View>
  );
}

function Home({ onPick }: { onPick: (page: 'values' | 'patterns') => void }) {
  return <ScrollView contentContainerStyle={styles.home}>
    <View style={styles.brand}><Text style={styles.brandMark}>✦</Text><Heading style={styles.brandTitle}>My Goals</Heading></View>
    <Text style={styles.muted}>Choose an activity to get started.</Text>
    <Card icon="🌱" title="My Values" body="Figure out what matters to you and choose a step toward it." color={Palette.accent2_700} onPress={() => onPick('values')} />
    <Card icon="📊" title="My Patterns" body="See what you&apos;ve noticed about social media and choose something you want to work on." color={Palette.accent700} onPress={() => onPick('patterns')} />
  </ScrollView>;
}

function Card({ icon, title, body, color, onPress }: { icon: string; title: string; body: string; color: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.card}><Text style={styles.cardIcon}>{icon}</Text><Heading style={styles.cardTitle}>{title}</Heading><Text style={styles.body}>{body}</Text><Text style={[styles.start, { color }]}>Start ›</Text></Pressable>;
}

function Values({ step, selected, onSelect, text, setText }: { step: number; selected: string | null; onSelect: (item: string) => void; text: string; setText: (value: string) => void }) {
  const [showIdeas, setShowIdeas] = useState(false);
  if (step === 0) return <><Text style={styles.kicker}>VALUE</Text><Text style={styles.body}>A value is something you care about, like health, family, friendship, learning, or being kind to yourself.</Text><Heading style={styles.question}>What value do you care about?</Heading><Choices items={values} selected={selected} onSelect={onSelect} /><Btn label="Need an idea?" variant="ghost" onPress={() => setShowIdeas((shown) => !shown)} />{showIdeas ? <View style={styles.ideaList}>{['Being there for people I care about', 'Learning something new', 'Taking care of my wellbeing'].map((idea) => <Pressable key={idea} onPress={() => onSelect(idea)} style={styles.idea}><Text style={styles.body}>{idea}</Text></Pressable>)}</View> : null}</>;
  if (step === 1) return <><Text style={styles.body}>Write down behaviors that move you toward or away from {selected ?? 'your value'}.</Text><Text style={styles.kicker}>TOWARD</Text><TextInput value={text} onChangeText={setText} placeholder="What behavior moves you toward it?" placeholderTextColor={Palette.neutral600} style={styles.input} /><Text style={styles.kicker}>AWAY</Text><TextInput placeholder="What behavior moves you away from it?" placeholderTextColor={Palette.neutral600} style={styles.input} /></>;
  if (step === 2) return <><Text style={styles.kicker}>TOWARD</Text><Text style={styles.muted}>Which toward move would you like to work on?</Text><Text style={styles.kicker}>AWAY</Text><Text style={styles.muted}>Go back to Moves to add some behaviors.</Text></>;
  return <Review value={selected ?? '-'} move={text || '-'} />;
}

function Patterns({
  step, selectedPatternId, onSelectPattern,
  workOnText, setWorkOnText,
  smallStepText, setSmallStepText,
  doabilityRating, setDoabilityRating,
  reflectionNotes, setReflectionNotes,
}: {
  step: number;
  selectedPatternId: string | null;
  onSelectPattern: (id: string) => void;
  workOnText: string;
  setWorkOnText: (value: string) => void;
  smallStepText: string;
  setSmallStepText: (value: string) => void;
  doabilityRating: string | null;
  setDoabilityRating: (value: string) => void;
  reflectionNotes: string;
  setReflectionNotes: (value: string) => void;
}) {
  const barCards = getPatternBarCards();
  const otherOption = getOtherPatternOption();
  const selectedCard = [...barCards, otherOption].find((card) => card.id === selectedPatternId);
  const selectedTitle = selectedCard?.title ?? 'your pattern';
  const selectedBarCard = barCards.find((card) => card.id === selectedPatternId);

  if (step === 0) return <>
    <Heading style={styles.question}>Your patterns</Heading>
    <Text style={styles.body}>Here&apos;s what you&apos;ve been noticing lately. Tap a box below to select it.</Text>
    <View style={styles.barCardsList}>
      {barCards.map((card) => (
        <PatternBarChart
          key={card.id}
          card={card}
          selected={card.id === selectedPatternId}
          onSelect={() => onSelectPattern(card.id)}
        />
      ))}
      <Pressable
        onPress={() => onSelectPattern(otherOption.id)}
        style={[styles.barCard, otherOption.id === selectedPatternId && styles.barCardOn]}
      >
        <Heading style={styles.barCardTitle}>{otherOption.title}</Heading>
        {otherOption.description ? <Text style={styles.otherSubtitle}>{otherOption.description}</Text> : null}
      </Pressable>
    </View>
  </>;
  if (step === 1) return <PromptStep
    kicker="WORK ON"
    question="What do you want to work on?"
    selectedTitle={selectedTitle}
    value={workOnText}
    onChange={setWorkOnText}
    placeholder="What do you want to work on?"
    prompts={getStarterPrompts(selectedPatternId ?? 'other', 'workOn')}
    patternPreview={selectedBarCard}
  />;
  if (step === 2) return <PromptStep
    kicker="SMALL STEP"
    question="What's one small step you can take this week?"
    selectedTitle={selectedTitle}
    value={smallStepText}
    onChange={setSmallStepText}
    placeholder="What's one small step you can take this week?"
    prompts={getStarterPrompts(selectedPatternId ?? 'other', 'smallStep')}
  />;

  const showReflection = doabilityRating === 'A little hard' || doabilityRating === "I'm not sure";
  return <>
    <Text style={styles.kicker}>WHAT I&apos;M TRYING TO WORK ON</Text>
    <Text style={styles.body}>{workOnText || '-'}</Text>
    <Text style={styles.kicker}>MY SMALL STEP</Text>
    <Text style={styles.body}>{smallStepText || '-'}</Text>
    <Heading style={styles.question}>How doable does this feel?</Heading>
    <Choices items={getDoabilityOptions()} selected={doabilityRating} onSelect={setDoabilityRating} />
    {showReflection ? <>
      <Text style={styles.muted}>{getReflectionPrompt()}</Text>
      <TextInput
        value={reflectionNotes}
        onChangeText={setReflectionNotes}
        multiline
        placeholder="Optional notes…"
        placeholderTextColor={Palette.neutral600}
        style={styles.input}
      />
    </> : null}
  </>;
}

function PatternBarChart({ card, selected, onSelect }: { card: PatternBarCardData; selected: boolean; onSelect: () => void }) {
  const max = Math.max(...card.items.map((item) => item.value), 1);
  return <Pressable onPress={onSelect} style={[styles.barCard, selected && styles.barCardOn]}>
    <Heading style={styles.barCardTitle}>{card.title}</Heading>
    <View style={styles.barRows}>
      {card.items.map((item) => <View key={item.label} style={styles.barRow}>
        <View style={styles.barLabelRow}><Text style={styles.barText}>{item.label}</Text><Text style={styles.barValue}>{item.value}</Text></View>
        <View style={styles.barTrack}><View style={[styles.barFill, { width: `${(item.value / max) * 100}%` }]} /></View>
      </View>)}
    </View>
    <View style={styles.barCallout}><Text style={styles.barCalloutText}>{card.callout}</Text></View>
  </Pressable>;
}

function PatternPreview({ card }: { card: PatternBarCardData }) {
  const max = Math.max(...card.items.map((item) => item.value), 1);
  return <View style={[styles.barCard, styles.barCardPreview]}>
    <Text style={styles.kicker}>YOUR PATTERN</Text>
    <Heading style={styles.barCardTitle}>{card.title}</Heading>
    <View style={styles.barRows}>
      {card.items.map((item) => <View key={item.label} style={styles.barRow}>
        <View style={styles.barLabelRow}><Text style={styles.barText}>{item.label}</Text><Text style={styles.barValue}>{item.value}</Text></View>
        <View style={styles.barTrack}><View style={[styles.barFill, { width: `${(item.value / max) * 100}%` }]} /></View>
      </View>)}
    </View>
  </View>;
}

function PromptStep({
  kicker, question, selectedTitle, value, onChange, placeholder, prompts, patternPreview,
}: {
  kicker: string; question: string; selectedTitle: string; value: string; onChange: (value: string) => void; placeholder: string; prompts: string[]; patternPreview?: PatternBarCardData;
}) {
  const [showIdeas, setShowIdeas] = useState(false);
  return <>
    {patternPreview ? <PatternPreview card={patternPreview} /> : null}
    <Text style={styles.kicker}>{kicker}</Text>
    <Text style={styles.body}>{selectedTitle}</Text>
    <Heading style={styles.question}>{question}</Heading>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline
      placeholder={placeholder}
      placeholderTextColor={Palette.neutral600}
      style={styles.input}
    />
    <Btn label="Need an idea?" variant="ghost" onPress={() => setShowIdeas((shown) => !shown)} />
    {showIdeas ? <View style={styles.ideaList}>{prompts.map((prompt) => <Pressable key={prompt} onPress={() => onChange(prompt)} style={styles.idea}><Text style={styles.body}>{prompt}</Text></Pressable>)}</View> : null}
  </>;
}

function Choices({ items, selected, onSelect }: { items: string[]; selected: string | null; onSelect: (item: string) => void }) { return <View style={styles.choices}>{items.map((item) => <Pressable key={item} onPress={() => onSelect(item)} style={[styles.choice, item === selected && styles.choiceOn]}><Text style={styles.body}>{item}</Text></Pressable>)}</View>; }
function Review({ value, move }: { value: string; move: string }) { return <><Text style={styles.kicker}>WHAT MATTERS TO ME</Text><Text style={styles.body}>{value}</Text><Text style={styles.kicker}>MY TOWARD MOVE</Text><Text style={styles.body}>{move}</Text><Text style={styles.kicker}>MY PLAN</Text><View style={styles.input}><Text style={styles.muted}>-</Text></View><Heading style={styles.question}>Does this plan move you toward what matters to you?</Heading><Choices items={['Yes', 'A little', 'Not really', "I'm not sure"]} selected={null} onSelect={() => undefined} /></>; }

const styles = themedStyleSheet(() => ({ screen: { flex: 1, backgroundColor: Palette.bg }, tabs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Palette.neutral300, color: Palette.neutral600 }, tabOn: { color: Palette.accent2_700, fontWeight: '700' }, home: { padding: 20, gap: 16 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandMark: { color: Palette.accent2_700, fontSize: 26 }, brandTitle: { fontSize: 24 }, muted: { color: Palette.neutral700, fontSize: 14, lineHeight: 21 }, card: { backgroundColor: Palette.neutral100, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.xl, padding: 20, gap: 10, boxShadow: Shadow.elevSm }, cardIcon: { fontSize: 26 }, cardTitle: { fontSize: 20 }, start: { fontSize: 13, fontWeight: '700' }, content: { padding: 20, gap: 16, paddingBottom: 40 }, kicker: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700', letterSpacing: 0.7 }, question: { color: Palette.text, fontSize: 22, lineHeight: 28 }, body: { color: Palette.text, fontSize: 15, lineHeight: 23 }, choices: { gap: 10 }, choice: { padding: 15, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, boxShadow: Shadow.elevSm }, choiceOn: { borderColor: Palette.accent2, backgroundColor: Palette.accent2_100, boxShadow: Shadow.lg }, input: { minHeight: 72, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, padding: 14, color: Palette.text, boxShadow: Shadow.elevSm }, ideaList: { gap: 8 }, idea: { padding: 12, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, boxShadow: Shadow.elevSm }, barCardsList: { gap: 14 }, barCard: { gap: 14, padding: 16, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, boxShadow: Shadow.elevSm }, barCardOn: { borderColor: Palette.accent2, backgroundColor: Palette.accent2_100, boxShadow: Shadow.lg }, barCardPreview: { padding: 12, gap: 8 }, barCardTitle: { fontSize: 16 }, otherSubtitle: { color: Palette.neutral700, fontSize: 13, lineHeight: 18, fontWeight: '400' }, barCallout: { backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: Radius.lg, paddingVertical: 12, paddingHorizontal: 14 }, barCalloutText: { color: Palette.text, fontSize: 13, lineHeight: 19, fontWeight: '400' }, barRows: { gap: 12 }, barRow: { gap: 5 }, barLabelRow: { flexDirection: 'row', justifyContent: 'space-between' }, barText: { color: Palette.text, fontSize: 12 }, barValue: { color: Palette.neutral700, fontSize: 12 }, barTrack: { height: 8, borderRadius: Radius.pill, backgroundColor: Palette.neutral200, overflow: 'hidden' }, barFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Palette.accent2_700 }, footer: { padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: Palette.neutral300, gap: 10 }, disabled: { opacity: 0.35 } }));
