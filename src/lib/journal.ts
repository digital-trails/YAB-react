import AsyncStorage from '@react-native-async-storage/async-storage';

/** A single journal entry. */
export type JournalEntry = {
  id: string;
  text: string;
  /** Epoch milliseconds the entry was created. */
  createdAt: number;
};

const STORAGE_KEY = 'journal.entries.v1';

/** Loads all saved entries, newest first. Returns an empty list on first run. */
export async function loadEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/** Persists the full list of entries. */
async function saveEntries(entries: JournalEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** Adds a new entry and returns the updated list, newest first. */
export async function addEntry(
  text: string,
  entries: JournalEntry[],
): Promise<JournalEntry[]> {
  const entry: JournalEntry = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    text: text.trim(),
    createdAt: Date.now(),
  };
  const next = [entry, ...entries];
  await saveEntries(next);
  return next;
}

/** Removes the entry with the given id and returns the updated list. */
export async function deleteEntry(
  id: string,
  entries: JournalEntry[],
): Promise<JournalEntry[]> {
  const next = entries.filter((e) => e.id !== id);
  await saveEntries(next);
  return next;
}
