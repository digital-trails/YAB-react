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

export type ModuleDraft = {
  moduleId: string;
  title: string;
  route: string;
  step: number;
  totalSteps: number;
  state?: Record<string, unknown>;
  updatedAt: string;
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
  CREATE TABLE IF NOT EXISTS module_drafts (
    module_id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    route TEXT NOT NULL,
    step INTEGER NOT NULL,
    total_steps INTEGER NOT NULL,
    state TEXT,
    updated_at TEXT NOT NULL
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

export async function saveModuleDraft(draft: Omit<ModuleDraft, 'updatedAt'>): Promise<void> {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  if (Platform.OS === 'web') return;
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO module_drafts (module_id, title, route, step, total_steps, state, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    next.moduleId,
    next.title,
    next.route,
    next.step,
    next.totalSteps,
    next.state ? JSON.stringify(next.state) : null,
    next.updatedAt,
  );
}

export async function getModuleDraft(): Promise<ModuleDraft | null> {
  if (Platform.OS === 'web') return null;
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ moduleId: string; title: string; route: string; step: number; totalSteps: number; state?: string; updatedAt: string }>(
    'SELECT module_id AS moduleId, title, route, step, total_steps AS totalSteps, state, updated_at AS updatedAt FROM module_drafts ORDER BY updated_at DESC LIMIT 1',
  );
  if (!row) return null;
  return { ...row, state: row.state ? JSON.parse(row.state) : undefined };
}

export async function clearModuleDraft(moduleId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const database = await getDatabase();
  await database.runAsync('DELETE FROM module_drafts WHERE module_id = ?', moduleId);
}
