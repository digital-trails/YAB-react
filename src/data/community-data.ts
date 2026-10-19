import type { CommunityState } from '@/data/community-content';

const EMPTY_STATE: CommunityState = { savedPostIds: [], reportedPostIds: [], channels: [], submittedPosts: [] };

const STORAGE_KEY = 'yab-community-state';
const DB_NAME = 'yab-preferences.db';
let databasePromise: Promise<import('expo-sqlite').SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = import('expo-sqlite').then(async ({ openDatabaseAsync }) => {
      const database = await openDatabaseAsync(DB_NAME);
      await database.execAsync('CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)');
      return database;
    });
  }
  return databasePromise;
}

export async function getCommunityState(): Promise<CommunityState> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>('SELECT value FROM preferences WHERE key = ?', STORAGE_KEY);
  if (!row) return EMPTY_STATE;
  return parseState(row.value);
}

export async function saveCommunityState(state: CommunityState): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)', STORAGE_KEY, JSON.stringify(state));
}

function parseState(value: string): CommunityState {
  try {
    const parsed = JSON.parse(value);
    return {
      savedPostIds: Array.isArray(parsed?.savedPostIds) ? parsed.savedPostIds : [],
      reportedPostIds: Array.isArray(parsed?.reportedPostIds) ? parsed.reportedPostIds : [],
      channels: Array.isArray(parsed?.channels) ? parsed.channels : [],
      submittedPosts: Array.isArray(parsed?.submittedPosts) ? parsed.submittedPosts : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}
