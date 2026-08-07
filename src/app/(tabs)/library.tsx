import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Heading, Tag } from '@/components/ui';
import { Palette, Radius, Shadow } from '@/constants/tokens';

const CATEGORIES = [
  { tag: 'Tune In', tone: 'accent' as const, blurb: 'In-the-moment interventions for active comparison spirals.' },
  { tag: 'Shift It', tone: 'accent2' as const, blurb: 'Skills training that reshapes the pattern over time.' },
];

export default function LibraryScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Heading style={styles.title}>Library</Heading>
      <Text style={styles.subtitle}>Browse practices by how you want to work today.</Text>
      {CATEGORIES.map((cat) => (
        <View key={cat.tag} style={styles.card}>
          <Tag tone={cat.tone}>{cat.tag}</Tag>
          <Text style={styles.blurb}>{cat.blurb}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 26, color: Palette.text },
  subtitle: { fontSize: 13, color: Palette.neutral700 },
  card: {
    backgroundColor: '#FCF7EE',
    borderRadius: Radius.lg,
    padding: 16,
    gap: 10,
    boxShadow: Shadow.elevSm,
  },
  blurb: { fontSize: 13.5, color: Palette.text, lineHeight: 20 },
});
