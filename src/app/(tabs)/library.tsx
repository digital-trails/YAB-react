import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Btn, Heading } from '@/components/ui';
import { Palette, Radius, Shadow , themedStyleSheet } from '@/constants/tokens';

export default function LibraryScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
      scrollEnabled
      nestedScrollEnabled>
      <Heading style={styles.title}>Library</Heading>
      <Text style={styles.subtitle}>Small practices and reminders for your week.</Text>
      <Section title="Reflect">
        <LibraryCard title="My Thoughts" body="Slow down a comparison and look at it another way." onPress={() => router.push('/library-flow' as never)} />
        <LibraryCard title="My Goals" body="Choose what matters and take one small step toward it." onPress={() => router.push('/goals-flow' as never)} />
      </Section>
      <Section title="Notice the good">
        <LibraryCard title="I’m Doing It" body="Guess today’s positive word and remember when you showed it." onPress={() => router.push('/accomplishments-flow?section=game' as never)} />
        <LibraryCard title="My Wins" body="Save something you did well, big or small." onPress={() => router.push('/accomplishments-flow?section=wins' as never)} />
        <LibraryCard title="My Thanks" body="Notice the good stuff around you." onPress={() => router.push('/accomplishments-flow?section=thanks' as never)} />
      </Section>
      <Section title="Connect">
        <LibraryCard title="Community" body="Read what other people are sharing about comparison." onPress={() => router.push('/community-flow?section=community' as never)} />
        <LibraryCard title="My Board" body="Keep your wins, reflections, and reminders in one place." onPress={() => router.push('/community-flow?section=board' as never)} />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function LibraryCard({ title, body, onPress }: { title: string; body: string; onPress: () => void }) {
  return <View style={styles.card}><View style={styles.cardCopy}><Heading style={styles.cardTitle}>{title}</Heading><Text style={styles.cardBody}>{body}</Text></View><Btn label="Open" onPress={onPress} /></View>;
}

const styles = themedStyleSheet(() => ({
  scroll: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, paddingTop: 14, paddingBottom: 30, gap: 22 },
  title: { fontSize: 28, color: Palette.text },
  subtitle: { color: Palette.neutral700, fontSize: 14, marginTop: -14 },
  section: { gap: 10 },
  sectionTitle: { color: Palette.neutral700, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 16, boxShadow: Shadow.elevSm },
  cardCopy: { flex: 1, gap: 5 },
  cardTitle: { fontSize: 19, color: Palette.text },
  cardBody: { color: Palette.neutral700, fontSize: 13, lineHeight: 19 },
}));
