import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Heading } from '@/components/ui';
import { Palette, Radius } from '@/constants/tokens';

const values = ['Connection', 'Being Yourself', 'Growth', 'Achievement', 'Health & Well-Being', 'Creativity', 'Independence', 'Kindness', 'Fun', 'Something Else'];
const patterns = ['Scroll less when I catch myself comparing', 'See less content that makes me compare my appearance', 'Spend less time on TikTok', 'Be more selective about who I follow', 'Something else'];
const moves = ['Take a 10-minute break', 'Close the app when I catch myself comparing', 'Switch to something else I enjoy', 'Choose my own'];

export default function GoalsFlowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<'home' | 'values' | 'patterns'>('home');
  const [step, setStep] = useState(0);
  const [value, setValue] = useState<string | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [move, setMove] = useState<string | null>(null);
  const [text, setText] = useState('');

  const exit = () => router.back();
  const select = (item: string) => page === 'values' ? setValue(item) : setChoice(item);
  const selected = page === 'values' ? value : choice;
  const next = () => setStep((current) => current + 1);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => (page === 'home' ? exit() : step ? setStep(step - 1) : setPage('home'))} hitSlop={10}><Text style={styles.back}>‹</Text></Pressable>
        <Heading style={styles.title}>✦ My Goals</Heading>
        <Pressable onPress={exit} hitSlop={10}><Text style={styles.close}>×</Text></Pressable>
      </View>
      {page === 'home' ? <Home onPick={(nextPage) => { setPage(nextPage); setStep(0); }} /> : (
        <>
          <View style={styles.tabs}><Text style={styles.tabOn}>{page === 'values' ? 'VALUE' : 'PATTERNS'}</Text><Text>MOVES</Text><Text>PLAN</Text><Text>REVIEW</Text></View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {page === 'values' ? <Values step={step} selected={selected} onSelect={select} text={text} setText={setText} /> : <Patterns step={step} selected={selected} onSelect={select} move={move} setMove={setMove} />}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <Btn label={step >= 3 ? 'Finish' : 'Continue'} disabled={step < 3 && !selected && !(page === 'values' && step === 1)} onPress={step >= 3 ? exit : next} style={step < 3 && !selected && !(page === 'values' && step === 1) ? styles.disabled : undefined} />
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
  if (step === 0) return <><Text style={styles.kicker}>VALUE</Text><Text style={styles.body}>A value is something you care about and want to guide your choices, such as health, family, friendship, learning, or being kind to yourself.</Text><Heading style={styles.question}>What value do you care about?</Heading><Choices items={values} selected={selected} onSelect={onSelect} /></>;
  if (step === 1) return <><Text style={styles.body}>Write down behaviors that move you toward or away from {selected ?? 'your value'}.</Text><Text style={styles.kicker}>TOWARD</Text><TextInput value={text} onChangeText={setText} placeholder="What behavior moves you toward it?" placeholderTextColor={Palette.neutral600} style={styles.input} /><Text style={styles.kicker}>AWAY</Text><TextInput placeholder="What behavior moves you away from it?" placeholderTextColor={Palette.neutral600} style={styles.input} /></>;
  if (step === 2) return <><Text style={styles.kicker}>TOWARD</Text><Text style={styles.muted}>Which toward move would you like to work on?</Text><Text style={styles.kicker}>AWAY</Text><Text style={styles.muted}>Go back to Moves to add some behaviors.</Text></>;
  return <Review value={selected ?? '—'} move={text || '—'} />;
}

function Patterns({ step, selected, onSelect, move, setMove }: { step: number; selected: string | null; onSelect: (item: string) => void; move: string | null; setMove: (item: string) => void }) {
  if (step === 0) return <><Text style={styles.kicker}>PATTERNS</Text><Heading style={styles.question}>Your patterns</Heading><Text style={styles.body}>Here&apos;s what you&apos;ve been noticing lately.</Text><View style={styles.summary}><Text style={styles.body}>Appearance has been coming up the most for you lately.{`\n\n`}Most comparisons have happened on TikTok.{`\n\n`}Scrolling shows up in 8 of your 12 comparisons.{`\n\n`}These comparisons have tended to leave you feeling worse rather than better.</Text></View><Heading style={styles.question}>Choose something to work on</Heading></>;
  if (step === 1) return <><Text style={styles.kicker}>PICK ONE</Text><Heading style={styles.question}>What do you want to work on?</Heading><Text style={styles.body}>Based on your patterns, here are some ideas.</Text><Choices items={patterns} selected={selected} onSelect={onSelect} /></>;
  if (step === 2) return <><Text style={styles.kicker}>WORKING ON</Text><Heading style={styles.question}>What&apos;s one small thing you could try?</Heading><Choices items={moves} selected={move} onSelect={setMove} /></>;
  return <Review value={selected ?? '—'} move={move ?? '—'} />;
}

function Choices({ items, selected, onSelect }: { items: string[]; selected: string | null; onSelect: (item: string) => void }) { return <View style={styles.choices}>{items.map((item) => <Pressable key={item} onPress={() => onSelect(item)} style={[styles.choice, item === selected && styles.choiceOn]}><Text style={styles.body}>{item}</Text></Pressable>)}</View>; }
function Review({ value, move }: { value: string; move: string }) { return <><Text style={styles.kicker}>WHAT MATTERS TO ME</Text><Text style={styles.body}>{value}</Text><Text style={styles.kicker}>MY TOWARD MOVE</Text><Text style={styles.body}>{move}</Text><Text style={styles.kicker}>MY PLAN</Text><View style={styles.input}><Text style={styles.muted}>—</Text></View><Heading style={styles.question}>Does this plan move you toward what matters to you?</Heading><Choices items={['Yes', 'A little', 'Not really', 'I&apos;m not sure']} selected={null} onSelect={() => undefined} /></>; }

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Palette.bg }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }, back: { color: Palette.neutral700, fontSize: 34 }, close: { color: Palette.neutral700, fontSize: 30 }, title: { fontSize: 20, color: Palette.text }, tabs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Palette.neutral300, color: Palette.neutral600 }, tabOn: { color: Palette.accent2_700, fontWeight: '700' }, home: { padding: 20, gap: 16 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandMark: { color: Palette.accent2_700, fontSize: 26 }, brandTitle: { fontSize: 24 }, muted: { color: Palette.neutral700, fontSize: 14, lineHeight: 21 }, card: { backgroundColor: Palette.neutral100, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.xl, padding: 20, gap: 10 }, cardIcon: { fontSize: 26 }, cardTitle: { fontSize: 20 }, start: { fontSize: 13, fontWeight: '700' }, content: { padding: 20, gap: 16, paddingBottom: 40 }, kicker: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700', letterSpacing: 0.7 }, question: { color: Palette.text, fontSize: 22, lineHeight: 28 }, body: { color: Palette.text, fontSize: 15, lineHeight: 23 }, choices: { gap: 10 }, choice: { padding: 15, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100 }, choiceOn: { borderColor: Palette.accent2, backgroundColor: Palette.accent2_100 }, input: { minHeight: 72, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, padding: 14, color: Palette.text }, summary: { backgroundColor: Palette.neutral200, borderRadius: Radius.lg, padding: 16 }, footer: { padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: Palette.neutral300 }, disabled: { opacity: 0.35 } });
