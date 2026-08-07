import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Heading } from '@/components/ui';
import { Palette, Radius, Shadow } from '@/constants/tokens';

const STATS = [
  { value: '4', caption: 'day streak' },
  { value: '6', caption: 'sessions' },
  { value: '38', caption: 'min practiced' },
];

export default function YouScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Heading style={styles.avatarLetter}>M</Heading>
        </View>
        <Heading style={styles.name}>Maya</Heading>
      </View>
      <View style={styles.statsRow}>
        {STATS.map((stat) => (
          <View key={stat.caption} style={styles.statTile}>
            <Heading style={styles.statValue}>{stat.value}</Heading>
            <Text style={styles.statCaption}>{stat.caption}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, gap: 20, alignItems: 'center' },
  header: { alignItems: 'center', gap: 10, paddingTop: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Palette.accent2_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 28, color: Palette.accent2_700 },
  name: { fontSize: 24, color: Palette.text },
  statsRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 16,
    backgroundColor: '#FCF7EE',
    borderRadius: Radius.lg,
    boxShadow: Shadow.elevSm,
  },
  statValue: { fontSize: 20, color: Palette.accent2_700 },
  statCaption: { fontSize: 10.5, color: Palette.neutral700 },
});
