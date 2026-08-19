import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Heading } from '@/components/ui';
import { Palette, Radius, Shadow } from '@/constants/tokens';

const ACTIVITY = [
  {
    day: 'Today',
    activity: 'My Thoughts',
    response:
      "I'm proud of finishing my homework today, it was difficult but I did it.",
    time: '6:00 PM',
  },
  {
    day: 'Yesterday',
    activity: 'My Values',
    response:
      'I think social media makes it harder for me to follow my value of peace because it is easy to get caught up in what everyone else is doing.',
    time: '9:00 AM',
  },
  {
    day: 'Monday',
    activity: 'My Thanks',
    response:
      "I'm grateful that my friend checked in on me when I was having a stressful day.",
    time: '8:32 PM',
  },
  {
    day: 'Sunday',
    activity: 'My Wins',
    response:
      'I finished my physics assignment even though I really wanted to put it off.',
    time: '4:15 PM',
  },
];

export default function YouScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Heading style={styles.avatarLetter}>M</Heading>
        </View>

        <Heading style={styles.name}>Maya</Heading>

        <Text style={styles.summary}>4 day streak · 6 sessions</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.activitySection}>
        <Heading style={styles.activityTitle}>Your activity</Heading>

        {ACTIVITY.map((entry, index) => (
          <View key={`${entry.activity}-${index}`} style={styles.entryGroup}>
            <Text style={styles.day}>{entry.day}</Text>

            <View style={styles.entry}>
              <Heading style={styles.entryTitle}>{entry.activity}</Heading>

              <Text style={styles.response}>{entry.response}</Text>

              <Text style={styles.time}>{entry.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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

  header: {
    alignItems: 'center',
    gap: 5,
    paddingTop: 8,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.accent2_200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLetter: {
    fontSize: 25,
    color: Palette.accent2_700,
  },

  name: {
    fontSize: 23,
    color: Palette.text,
  },

  summary: {
    color: Palette.neutral700,
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: Palette.neutral300,
  },

  activitySection: {
    gap: 16,
  },

  activityTitle: {
    fontSize: 23,
    color: Palette.text,
  },

  entryGroup: {
    gap: 7,
  },

  day: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.neutral700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  entry: {
    gap: 7,
    padding: 14,
    backgroundColor: Palette.neutral100,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.neutral300,
    boxShadow: Shadow.elevSm,
  },

  entryTitle: {
    fontSize: 18,
    color: Palette.text,
  },

  response: {
    fontSize: 14,
    lineHeight: 21,
    color: Palette.text,
  },

  time: {
    fontSize: 11,
    color: Palette.neutral700,
  },
});