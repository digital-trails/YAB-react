import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';

import { Heading } from '@/components/ui';
import { Palette, Radius, Shadow } from '@/constants/tokens';

export default function LibraryScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Heading style={styles.title}>Library</Heading>

      <Text style={styles.subtitle}>
        Small practices and reminders for your week.
      </Text>

      <LibrarySection
        title="Reflect"
        description="Slow down, check in, and think things through."
      >
        <LibraryCard
          title="My Thoughts"
          body="Slow down a comparison and look at it another way."
          onPress={() => router.push('/library-flow' as never)}
        />

        <LibraryCard
          title="My Goals"
          body="Choose what matters and take one small step toward it."
          onPress={() => router.push('/goals-flow' as never)}
        />
      </LibrarySection>

      <LibrarySection
        title="Notice the good"
        description="Pay attention to the things that are going well."
      >
        <LibraryCard
          title="I’m Doing It"
          body="Guess today's positive word and remember when you showed it."
          onPress={() =>
            router.push('/accomplishments-flow?section=game' as never)
          }
        />

        <LibraryCard
          title="My Wins"
          body="Save something you did well, big or small."
          onPress={() =>
            router.push('/accomplishments-flow?section=wins' as never)
          }
        />

        <LibraryCard
          title="My Thanks"
          body="Notice the good stuff around you."
          onPress={() =>
            router.push('/accomplishments-flow?section=thanks' as never)
          }
        />
      </LibrarySection>

      <LibrarySection
        title="Connect"
        description="Reflect with others and keep your community close."
      >
        <LibraryCard
          title="Community"
          body="Read what other people are sharing about comparison."
          onPress={() =>
            router.push('/community-flow?section=community' as never)
          }
        />

        <LibraryCard
          title="My Board"
          body="Keep your wins, reflections, and reminders in one place."
          onPress={() =>
            router.push('/community-flow?section=board' as never)
          }
        />
      </LibrarySection>
    </ScrollView>
  );
}

function LibrarySection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <Text style={styles.sectionDescription}>{description}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardRow}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function LibraryCard({
  title,
  body,
  onPress,
}: {
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardContent}>
        <Heading style={styles.cardTitle}>{title}</Heading>

        <Text style={styles.cardBody}>{body}</Text>

        <Text style={styles.cardArrow}>→</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Palette.bg,
  },

  content: {
    padding: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 20,
  },

  title: {
    fontSize: 28,
    color: Palette.text,
  },

  subtitle: {
    color: Palette.neutral700,
    fontSize: 14,
    marginTop: -20,
    lineHeight: 20,
  },

  section: {
    gap: 6,
  },

  sectionTitle: {
    color: Palette.text,
    fontSize: 21,
    fontWeight: '700',
  },

  sectionDescription: {
    color: Palette.neutral700,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },

  cardRow: {
    gap: 12,
    paddingRight: 20,
  },

  card: {
    width: 160,
    minHeight: 170,
    backgroundColor: Palette.neutral100,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.neutral300,
    padding: 15,
    boxShadow: Shadow.elevSm,
  },

  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },

  cardTitle: {
    fontSize: 18,
    color: Palette.text,
    lineHeight: 23,
  },

  cardBody: {
    color: Palette.neutral700,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  cardArrow: {
    color: Palette.accent700,
    fontSize: 22,
    marginTop: 12,
  },
});