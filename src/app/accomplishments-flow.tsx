import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Heading } from '@/components/ui';
import { Palette, Radius , themedStyleSheet } from '@/constants/tokens';
import { clearModuleDraft, getModuleDraft, recordModuleCompletion, saveModuleDraft } from '@/data/module-history';

const keys = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
const wins = [
  ['Small Wins', 'Finished something I had been putting off all week.', 'Jul 30'],
  ['Small Wins', 'Made my friend laugh when they were having a rough day.', 'Aug 1'],
  ['Medium Wins', 'Improved at something after working on it for a while.', 'Aug 4'],
  ['Medium Wins', 'Asked for help instead of giving up on my homework.', 'Aug 5'],
  ['Big Wins', 'Finished a science project I worked on for three weeks.', 'Jul 28'],
];
const words = ['Brave', 'Kind', 'Patient', 'Creative', 'Strong', 'Thoughtful', 'Caring', 'Curious', 'Resilient'];

export default function AccomplishmentsFlow() {
  const router = useRouter();
  const { section, resume } = useLocalSearchParams<{ section?: string; resume?: string }>();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<'game' | 'wins' | 'addWin' | 'thanks' | 'thanksAdd' | 'cards' | 'choice'>((section === 'wins' ? 'wins' : section === 'thanks' ? 'thanks' : 'game'));
  const [guess, setGuess] = useState('');
  const [win, setWin] = useState('');
  const [thanks, setThanks] = useState('');
  const [word, setWord] = useState<string | null>(null);

  useEffect(() => {
    if (!resume) return;
    void getModuleDraft().then((draft) => {
      if (!draft || draft.moduleId !== 'accomplishments') return;
      const state = draft.state as { page?: typeof page; guess?: string; win?: string; thanks?: string; word?: string | null } | undefined;
      if (state?.page) setPage(state.page);
      if (state) { setGuess(state.guess ?? ''); setWin(state.win ?? ''); setThanks(state.thanks ?? ''); setWord(state.word ?? null); }
    });
  }, [resume]);

  useEffect(() => {
    if (page !== 'game' || guess || win || thanks || word) void saveModuleDraft({ moduleId: 'accomplishments', title: 'Notice the good', route: `/accomplishments-flow?section=${section ?? 'game'}`, step: 0, totalSteps: 1, state: { page, guess, win, thanks, word } });
  }, [guess, page, section, thanks, win, word]);

  const complete = async (moduleId: string, title: string, body?: string) => {
    await recordModuleCompletion({ moduleId, title, body });
    await clearModuleDraft('accomplishments');
    router.back();
  };

  const back = () => {
    if (page === 'addWin') setPage('wins');
    else if (page === 'thanksAdd' || page === 'cards' || page === 'choice') setPage('thanks');
    else router.back();
  };
  const shell = (title: string, children: ReactNode) => <Shell title={title} onBack={back} insets={insets}>{children}</Shell>;

  if (page === 'game') return shell('✨ I’m Doing It', <><Text style={styles.body}>Guess the 5-letter positive word. Green = right spot. Yellow = in the word.</Text><View style={styles.guessRow}>{[0,1,2,3,4].map((i) => <View key={i} style={styles.letter}><Text>{guess[i] ?? ''}</Text></View>)}</View><View style={styles.keyboard}>{keys.map((key) => <Pressable key={key} onPress={() => key === '⌫' ? setGuess(guess.slice(0, -1)) : guess.length < 5 && setGuess(guess + key)} style={styles.key}><Text>{key}</Text></Pressable>)}</View><Btn label="Enter" disabled={guess.length !== 5} onPress={() => complete('doing-it', 'I’m Doing It', word ?? 'Completed the positive word game.')} /></>);
  if (page === 'wins') return shell('My Accomplishments', <><Text style={styles.privacy}>🔒 This is just for you.</Text><Text style={styles.body}>Sometimes it&apos;s easy to forget the things we&apos;ve already done. Keep track of the things you&apos;re proud of here so you can look back on them later.</Text><Btn label="+ Add an accomplishment" onPress={() => setPage('addWin')} />{wins.map(([category, body, date]) => <View key={body} style={styles.card}><Text style={styles.kicker}>{category}</Text><Text style={styles.body}>{body}</Text><Text style={styles.date}>{date}</Text></View>)}</>);
  if (page === 'addWin') return shell('My Accomplishments', <><Heading style={styles.question}>What&apos;d you get done?</Heading><Text style={styles.body}>There&apos;s no wrong answer. Every accomplishment counts.</Text><TextInput value={win} onChangeText={setWin} multiline placeholder="Write it here…" placeholderTextColor={Palette.neutral600} style={styles.input} /><Text style={styles.kicker}>HOW BIG WAS IT?</Text><View style={styles.choices}>{['Small Win', 'Medium Win', 'Big Win', 'Not sure?'].map((item) => <Text key={item} style={styles.choice}>{item}</Text>)}</View><Btn label="Add my win" disabled={!win.trim()} onPress={() => complete('wins', 'My Wins', win.trim())} /></>);
  if (page === 'thanks') return shell('🙏 My Thanks', <><Text style={styles.privacy}>🔒 This is just for you.</Text><View style={styles.card}><Text style={styles.icon}>💛</Text><Heading style={styles.cardTitle}>Something I&apos;m Thankful For</Heading><Text style={styles.body}>Taking a second to notice the good stuff — big or small — can help you appreciate what&apos;s already around you.</Text><Btn label="Start" onPress={() => setPage('thanksAdd')} /></View><View style={styles.card}><Text style={styles.icon}>🃏</Text><Heading style={styles.cardTitle}>Something I Appreciate About Myself</Heading><Text style={styles.body}>Version A — shuffle positive words until one feels like you.</Text><Btn label="Start" onPress={() => setPage('cards')} /></View><View style={styles.card}><Text style={styles.icon}>⚡</Text><Heading style={styles.cardTitle}>Something I Appreciate About Myself</Heading><Text style={styles.body}>Version B — pick between two words, three rounds.</Text><Btn label="Start" onPress={() => setPage('choice')} /></View></>);
  if (page === 'thanksAdd') return shell('My Thanks', <><Text style={styles.icon}>💛</Text><Heading style={styles.question}>Something I&apos;m Thankful For</Heading><Text style={styles.body}>What&apos;s something you&apos;re thankful for today?</Text><TextInput value={thanks} onChangeText={setThanks} multiline placeholder="Write it here…" placeholderTextColor={Palette.neutral600} style={styles.input} /><Text style={styles.muted}>Need an idea? Surprise me</Text><Btn label="Save" disabled={!thanks.trim()} onPress={() => complete('thanks', 'My Thanks', thanks.trim())} /></>);
  if (page === 'cards') return shell('My Thanks', <><Heading style={styles.question}>Something I Appreciate About Myself</Heading><Text style={styles.body}>Tap a card to flip it and reveal a word.</Text><View style={styles.cardGrid}>{words.map((item) => <Pressable key={item} onPress={() => setWord(item)} style={styles.wordCard}><Text style={styles.body}>{word === item ? item : '✦'}</Text></Pressable>)}</View><Text style={styles.muted}>Not sure? Shuffle the cards</Text><Btn label="Continue" disabled={!word} onPress={() => complete('self-appreciation', 'Something I Appreciate About Myself', word ?? undefined)} /></>);
  return shell('My Thanks', <><Heading style={styles.question}>Something I Appreciate About Myself</Heading><Text style={styles.body}>Choose the word that feels most like you.</Text><View style={styles.choices}><Pressable style={styles.choice}><Text style={styles.body}>Kind</Text></Pressable><Pressable style={styles.choice}><Text style={styles.body}>Brave</Text></Pressable></View><Btn label="Continue" onPress={() => complete('self-appreciation', 'Something I Appreciate About Myself', 'Chose a quality that felt like me.')} /></>);
}

function Shell({ title, onBack, insets, children }: { title: string; onBack: () => void; insets: { top: number; bottom: number }; children: ReactNode }) { return <View style={[styles.screen, { paddingTop: insets.top }]}><View style={styles.header}><Pressable onPress={onBack}><Text style={styles.back}>‹</Text></Pressable><Heading style={styles.title}>{title}</Heading><Pressable onPress={onBack}><Text style={styles.close}>×</Text></Pressable></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView><View style={{ height: insets.bottom + 12 }} /></View>; }
const styles = themedStyleSheet(() => ({ screen: { flex: 1, backgroundColor: Palette.bg }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }, back: { fontSize: 34, color: Palette.neutral700 }, close: { fontSize: 28, color: Palette.neutral700 }, title: { fontSize: 22 }, content: { padding: 20, gap: 16 }, body: { color: Palette.text, fontSize: 15, lineHeight: 22 }, muted: { color: Palette.neutral700, fontSize: 14, lineHeight: 20 }, privacy: { color: Palette.accent2_700, fontSize: 13, fontWeight: '700' }, card: { backgroundColor: Palette.neutral100, borderRadius: Radius.xl, borderWidth: 1, borderColor: Palette.neutral300, padding: 18, gap: 8 }, icon: { fontSize: 25 }, cardTitle: { fontSize: 20 }, kicker: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700', letterSpacing: 0.7 }, question: { fontSize: 22, color: Palette.text }, input: { minHeight: 110, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, padding: 14, color: Palette.text, textAlignVertical: 'top' }, choices: { gap: 10 }, choice: { padding: 15, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100 }, date: { color: Palette.neutral600, fontSize: 11 }, guessRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' }, letter: { width: 48, height: 48, borderWidth: 1, borderColor: Palette.neutral300, backgroundColor: Palette.neutral100, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm }, keyboard: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }, key: { width: 30, paddingVertical: 10, alignItems: 'center', backgroundColor: Palette.neutral200, borderRadius: 6 }, cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, wordCard: { width: '30%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.lg, backgroundColor: Palette.accent2_100 } }));
