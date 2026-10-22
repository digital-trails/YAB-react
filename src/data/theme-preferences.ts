import type { ThemeName } from '@/constants/tokens';

const STORAGE_KEY = 'yab-theme';
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

export async function getSavedTheme(): Promise<ThemeName | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>('SELECT value FROM preferences WHERE key = ?', STORAGE_KEY);
  return isThemeName(row?.value) ? row.value : null;
}

export async function saveTheme(theme: ThemeName): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)', STORAGE_KEY, theme);
}

function isThemeName(value: unknown): value is ThemeName {
  return value === 'warm' || value === 'calm' || value === 'dark' || value === 'colorful';
}
