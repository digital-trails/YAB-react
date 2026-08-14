import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Heading } from '@/components/ui';
import { Palette, Radius } from '@/constants/tokens';

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
  const { section } = useLocalSearchParams<{ section?: string }>();
  const insets = useSafeAreaInsets();
  const isBoard = section === 'board';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}><Btn label="‹" variant="ghost" onPress={router.back} /><Heading style={styles.title}>{isBoard ? 'Things that matter to me' : 'Community'}</Heading></View>
      <Text style={styles.subtitle}>{isBoard ? 'Your stuff, all in one place. Wins, reflections, saved thoughts, and things you\'ve shared will show up here.' : 'See what other people are sharing about comparison, what gets to them, what\'s helped, and the things they wish more people talked about.'}</Text>
      <View style={styles.filters}>{(isBoard ? ['All', 'Proud of', 'Small wins', 'Gratitude', 'Strengths', 'Kindness'] : ['All', 'Tips & Advice', 'Not Just Me', 'Little Reminders']).map((item) => <Text key={item} style={styles.filter}>{item}</Text>)}</View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isBoard ? boardPosts.map(([icon, label, body, date]) => <View key={body} style={styles.card}><Text style={styles.icon}>{icon}</Text><Text style={styles.label}>{label}</Text><Text style={styles.body}>{body}</Text><Text style={styles.date}>{date}</Text></View>) : communityPosts.map((post, index) => <View key={post} style={styles.card}><Text style={styles.label}>{index < 5 ? 'Tips & Advice' : 'Little Reminder'}</Text><Text style={styles.body}>{post}</Text><Text style={styles.date}>{index < 2 ? `${index + 2}h ago` : 'Yesterday'}</Text></View>)}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: Palette.bg, paddingHorizontal: 20 }, list: { paddingTop: 4 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, title: { fontSize: 22, flex: 1 }, subtitle: { color: Palette.neutral700, fontSize: 14, lineHeight: 20, marginBottom: 14 }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }, filter: { color: Palette.accent2_800, backgroundColor: Palette.neutral200, borderRadius: Radius.pill, paddingVertical: 7, paddingHorizontal: 12, fontSize: 12, fontWeight: '700' }, card: { backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 15, marginBottom: 10, gap: 6 }, icon: { fontSize: 22 }, label: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700' }, body: { color: Palette.text, fontSize: 14.5, lineHeight: 21 }, date: { color: Palette.neutral600, fontSize: 11 } });
