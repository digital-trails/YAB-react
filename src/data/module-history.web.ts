export type ModuleCompletion = {
  id: number;
  moduleId: string;
  title: string;
  body?: string;
  metadata?: Record<string, string | number | boolean | null>;
  completedAt: string;
};

type CompletionInput = Omit<ModuleCompletion, 'id' | 'completedAt'> & { completedAt?: string };

type StoredCompletion = Omit<ModuleCompletion, 'id'>;

const STORAGE_KEY = 'yab-module-completions';
let completions: StoredCompletion[] | null = null;

function read(): StoredCompletion[] {
  if (completions) return completions;
  if (typeof localStorage === 'undefined') return (completions = []);

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    completions = Array.isArray(saved) ? saved : [];
  } catch {
    completions = [];
  }
  return completions;
}

function write(next: StoredCompletion[]) {
  completions = next;
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function recordModuleCompletion(input: CompletionInput): Promise<void> {
  write([
    {
      moduleId: input.moduleId,
      title: input.title,
      body: input.body,
      metadata: input.metadata,
      completedAt: input.completedAt ?? new Date().toISOString(),
    },
    ...read(),
  ]);
}

export async function getModuleCompletions(since?: Date): Promise<ModuleCompletion[]> {
  const sinceIso = since?.toISOString();
  return read()
    .map((completion, index) => ({ ...completion, id: index + 1 }))
    .filter((completion) => !sinceIso || completion.completedAt >= sinceIso)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}
