import { Platform } from 'react-native';

// Native persistence uses SQLite; the web implementation lives in module-history.web.ts.

export type ModuleCompletion = {
  id: number;
  moduleId: string;
  title: string;
  body?: string;
  metadata?: Record<string, string | number | boolean | null>;
  completedAt: string;
};

type CompletionInput = Omit<ModuleCompletion, 'id' | 'completedAt'> & { completedAt?: string };

const DB_NAME = 'yab-history.db';
const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS module_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    metadata TEXT,
    completed_at TEXT NOT NULL
  );
`;

let databasePromise: Promise<import('expo-sqlite').SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = import('expo-sqlite').then(async ({ openDatabaseAsync }) => {
      const database = await openDatabaseAsync(DB_NAME);
      await database.execAsync(TABLE_SQL);
      try {
        await database.execAsync('ALTER TABLE module_completions ADD COLUMN metadata TEXT');
      } catch {
        // Existing installs already have the column.
      }
      return database;
    });
  }
  return databasePromise;
}

export async function recordModuleCompletion(input: CompletionInput): Promise<void> {
  const completedAt = input.completedAt ?? new Date().toISOString();

  if (Platform.OS === 'web') return;

  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO module_completions (module_id, title, body, metadata, completed_at) VALUES (?, ?, ?, ?, ?)',
    input.moduleId,
    input.title,
    input.body ?? null,
    input.metadata ? JSON.stringify(input.metadata) : null,
    completedAt,
  );
}

export async function getModuleCompletions(since?: Date): Promise<ModuleCompletion[]> {
  const sinceIso = since?.toISOString();

  if (Platform.OS === 'web') return [];

  const database = await getDatabase();
  const rows = sinceIso
    ? await database.getAllAsync<ModuleCompletion>(
        'SELECT id, module_id AS moduleId, title, body, metadata, completed_at AS completedAt FROM module_completions WHERE completed_at >= ? ORDER BY completed_at DESC',
        sinceIso,
      )
    : await database.getAllAsync<ModuleCompletion>(
        'SELECT id, module_id AS moduleId, title, body, metadata, completed_at AS completedAt FROM module_completions ORDER BY completed_at DESC',
      );

  return rows.map((row) => ({
    ...row,
    metadata: typeof row.metadata === 'string' ? parseMetadata(row.metadata) : row.metadata,
  }));
}

function parseMetadata(value: string): Record<string, string | number | boolean | null> | undefined {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
}
