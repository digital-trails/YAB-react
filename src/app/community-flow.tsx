import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Heading } from '@/components/ui';
import { Palette, Radius , themedStyleSheet } from '@/constants/tokens';
import { clearModuleDraft, getModuleDraft, recordModuleCompletion, saveModuleDraft } from '@/data/module-history';

const communityPosts = [
  'Muting people for a little bit actually helped way more than I thought.',
  'If I notice I\'m comparing a lot, I get off the app and do something else for like 10 minutes.',
  'Sometimes I remind myself I\'m literally only seeing what they chose to post.',
  'Talking to one of my friends usually gets me out of my head.',
  'Seeing everyone post when they\'re hanging out without me gets to me even when I know it probably isn\'t that deep.',
  'Someone else doing well doesn\'t mean you\'re doing badly.',
  'You\'re seeing one post, not their whole life.',
  'It\'s okay to log off.',
];
const boardPosts = [
  ['⭐', 'Something I\'m proud of', 'I finished a project I had been putting off for weeks.', 'Today'],
  ['🎉', 'A small win', "I went for a walk even when I really didn't feel like it.", 'Yesterday'],
  ['💛', 'Something kind I did', 'I helped my friend study for their exam.', '2 days ago'],
  ['🌱', 'Something I\'m grateful for', 'My dog being so excited every time I come home.', '3 days ago'],
  ['🌸', 'Something I like about myself', "I'm a good listener and people trust me with things.", 'Last week'],
];

export default function CommunityFlow() {
  const router = useRouter();
  const { section, resume } = useLocalSearchParams<{ section?: string; resume?: string }>();
  const insets = useSafeAreaInsets();
  const isBoard = section === 'board';
  const [query, setQuery] = useState('');
  const [pinned, setPinned] = useState<string[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(false);
  useEffect(() => {
    if (resume !== '1') return;
    void getModuleDraft().then((draft) => {
      if (draft?.moduleId !== 'community') return;
      const state = draft.state as { query?: string; pinned?: string[] } | undefined;
      if (state) { setQuery(state.query ?? ''); setPinned(state.pinned ?? []); }
    });
  }, [resume]);
  useEffect(() => {
    void saveModuleDraft({ moduleId: 'community', title: isBoard ? 'My Board' : 'Community', route: `/community-flow?section=${section ?? 'community'}`, step: 0, totalSteps: 1, state: { query, pinned } });
  }, [isBoard, pinned, query, section]);
  const cards = isBoard ? boardPosts.map(([icon, label, body, date]) => ({ icon, label, body, date })) : communityPosts.map((body, index) => ({ icon: '', label: index < 5 ? 'Tips & Advice' : 'Little Reminder', body, date: index < 2 ? `${index + 2}h ago` : 'Yesterday' }));
  const filteredCards = cards.filter((card) => `${card.label} ${card.body}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(pinned.includes(b.body)) - Number(pinned.includes(a.body)));
  const togglePin = (body: string) => setPinned((current) => current.includes(body) ? current.filter((item) => item !== body) : [...current, body]);
  const finish = async () => {
    await recordModuleCompletion({
      moduleId: isBoard ? 'board' : 'community',
      title: isBoard ? 'My Board' : 'Community',
      body: isBoard ? 'Looked back at things that matter to me.' : 'Spent time connecting with the community.',
    });
    await clearModuleDraft('community');
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}><Btn label="‹" variant="ghost" onPress={router.back} /><Heading style={styles.title}>{isBoard ? 'Things that matter to me' : 'Community'}</Heading></View>
      <Text style={styles.subtitle}>{isBoard ? 'Your stuff, all in one place. Wins, reflections, saved thoughts, and things you\'ve shared will show up here.' : 'See what other people are sharing about comparison, what gets to them, what\'s helped, and the things they wish more people talked about.'}</Text>
      <TextInput value={query} onChangeText={setQuery} placeholder={`Search ${isBoard ? 'your board' : 'suggestions'}…`} placeholderTextColor={Palette.neutral600} style={styles.search} />
      <View style={styles.filters}>{(isBoard ? ['All', 'Proud of', 'Small wins', 'Gratitude', 'Strengths', 'Kindness'] : ['All', 'Tips & Advice', 'Not Just Me', 'Little Reminders']).map((item) => <Text key={item} style={styles.filter}>{item}</Text>)}</View>
      <Btn label={showComposer ? 'Cancel submission' : isBoard ? 'Create a board post' : 'Submit a suggestion'} variant="ghost" onPress={() => setShowComposer((shown) => !shown)} />
      {showComposer ? <View style={styles.composer}><Text style={styles.body}>Share something for this board.</Text><TextInput placeholder="Write your submission…" placeholderTextColor={Palette.neutral600} style={styles.composerInput} /><Btn label="Submit for review" onPress={() => { setShowComposer(false); setSubmissionMessage(true); }} /></View> : null}
      {submissionMessage ? <Text style={styles.reviewNote}>Your submission will be reviewed within 24 hours by admins.</Text> : null}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filteredCards.map((card) => <View key={card.body} style={styles.card}><Text style={styles.icon}>{card.icon}</Text><Text style={styles.label}>{card.label}</Text><Text style={styles.body}>{card.body}</Text><Text style={styles.date}>{card.date}</Text><Pressable onPress={() => togglePin(card.body)}><Text style={styles.pin}>{pinned.includes(card.body) ? '📌 Pinned' : 'Pin this'}</Text></Pressable></View>)}
        <Btn label="Done" onPress={finish} /><View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = themedStyleSheet(() => ({ screen: { flex: 1, backgroundColor: Palette.bg, paddingHorizontal: 20 }, list: { paddingTop: 4 }, search: { borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, padding: 12, color: Palette.text, marginBottom: 10 }, composer: { gap: 10, padding: 14, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, borderWidth: 1, borderColor: Palette.neutral300 }, composerInput: { minHeight: 80, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.sm, padding: 10, color: Palette.text }, reviewNote: { color: Palette.accent2_700, fontSize: 13, lineHeight: 19 }, pin: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700' }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, title: { fontSize: 22, flex: 1 }, subtitle: { color: Palette.neutral700, fontSize: 14, lineHeight: 20, marginBottom: 14 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }, filter: { color: Palette.accent2_800, backgroundColor: Palette.neutral200, borderRadius: Radius.pill, paddingVertical: 7, paddingHorizontal: 12, fontSize: 12, fontWeight: '700' }, card: { backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 15, marginBottom: 10, gap: 6 }, icon: { fontSize: 22 }, label: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700' }, body: { color: Palette.text, fontSize: 14.5, lineHeight: 21 }, date: { color: Palette.neutral600, fontSize: 11 } }));
