import type { CommunityState } from '@/data/community-content';

const EMPTY_STATE: CommunityState = { savedPostIds: [], reportedPostIds: [], channels: [], submittedPosts: [] };
const STORAGE_KEY = 'yab-community-state';

export async function getCommunityState(): Promise<CommunityState> {
  if (typeof localStorage === 'undefined') return EMPTY_STATE;
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return EMPTY_STATE;
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

export async function saveCommunityState(state: CommunityState): Promise<void> {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
