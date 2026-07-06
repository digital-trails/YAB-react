import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  addEntry,
  deleteEntry,
  loadEntries,
  type JournalEntry,
} from '@/lib/journal';

/** Formats an entry timestamp like "Jul 6, 2026 · 2:15 PM". */
function formatDate(ms: number): string {
  const date = new Date(ms);
  return `${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} · ${date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function JournalScreen() {
  const theme = useTheme();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries().then((loaded) => {
      setEntries(loaded);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    const text = draft.trim();
    if (!text) return;
    setEntries(await addEntry(text, entries));
    setDraft('');
  }

  async function handleDelete(id: string) {
    setEntries(await deleteEntry(id, entries));
  }

  return (
    <ScreenContainer title="Journal" subtitle="Capture a thought. Entries are saved on this device.">
      <ThemedView type="backgroundElement" style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable
          onPress={handleSave}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: theme.backgroundSelected,
              opacity: !draft.trim() ? 0.5 : pressed ? 0.8 : 1,
            },
          ]}>
          <ThemedText type="smallBold">Save entry</ThemedText>
        </Pressable>
      </ThemedView>

      {loading ? (
        <ThemedText type="small" themeColor="textSecondary">
          Loading…
        </ThemedText>
      ) : entries.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          No entries yet. Write your first one above.
        </ThemedText>
      ) : (
        entries.map((entry) => (
          <ThemedView key={entry.id} type="backgroundElement" style={styles.entry}>
            <ThemedView type="backgroundElement" style={styles.entryHeader}>
              <ThemedText type="small" themeColor="textSecondary">
                {formatDate(entry.createdAt)}
              </ThemedText>
              <Pressable
                onPress={() => handleDelete(entry.id)}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <ThemedText type="link" themeColor="textSecondary">
                  Delete
                </ThemedText>
              </Pressable>
            </ThemedView>
            <ThemedText type="default">{entry.text}</ThemedText>
          </ThemedView>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  composer: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  input: {
    minHeight: 80,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlignVertical: 'top',
  },
  saveButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  entry: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
