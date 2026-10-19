import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, FlowHeader, Heading } from '@/components/ui';
import { Palette, Radius, Shadow, themedStyleSheet } from '@/constants/tokens';
import {
  clearModuleDraft,
  deleteModuleCompletion,
  getModuleCompletions,
  getModuleDraft,
  recordModuleCompletion,
  saveModuleDraft,
  updateModuleCompletion,
  type ModuleCompletion,
} from '@/data/module-history';
import { getCommunityState, saveCommunityState } from '@/data/community-data';
import {
  BOARD_FILTERS,
  CATEGORY_LABEL,
  CHANNEL_EMOJIS,
  COMM_CATEGORIES,
  COMM_FILTERS,
  NOTE_COLOR_ORDER,
  NOTE_ICONS,
  PROMPTS,
  SEED_POSTS,
  STARTERS,
  interleaveByCategory,
  type CommCategory,
  type CommPost,
  type MyChannel,
  type NoteColor,
} from '@/data/community-content';

// Every note/category color resolves to the app's own token palette (not
// hardcoded hex values) so it adapts across every app theme.
function noteColorTokens(color: NoteColor): { bg: string; border: string } {
  switch (color) {
    case 'peach': return { bg: Palette.accent200, border: Palette.accent700 };
    case 'mint': return { bg: Palette.accent2_100, border: Palette.accent2_200 };
    case 'lavender': return { bg: Palette.accent2_200, border: Palette.accent2_700 };
    case 'sky': return { bg: Palette.neutral200, border: Palette.neutral300 };
    case 'yellow':
    default: return { bg: Palette.accent100, border: Palette.accent200 };
  }
}

function categoryBadgeTokens(category: CommCategory): { bg: string; text: string } {
  switch (category) {
    case 'notjustme': return { bg: Palette.accent100, text: Palette.accent700 };
    case 'reminders': return { bg: Palette.neutral200, text: Palette.neutral700 };
    case 'tips':
    default: return { bg: Palette.accent2_100, text: Palette.accent2_700 };
  }
}

// Which legacy module completions also show up on "My Board", read-only.
const BOARD_MODULES: Record<string, { icon: string; label: string; filterId?: string }> = {
  'doing-it': { icon: '✨', label: 'I’m Doing It' },
  wins: { icon: '🎉', label: 'Small wins', filterId: 'win' },
  thanks: { icon: '💛', label: 'Gratitude', filterId: 'grateful' },
  'self-appreciation': { icon: '🌸', label: 'Strengths', filterId: 'like' },
};

type Screen = 'community' | 'board' | 'reflect' | 'write' | 'preview';

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'Last week';
  return date.toLocaleDateString();
}

export default function CommunityFlow() {
  const router = useRouter();
  const { section, resume } = useLocalSearchParams<{ section?: string; resume?: string }>();
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState<Screen>(section === 'board' ? 'board' : 'community');
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);

  // Persisted community state
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [reportedPostIds, setReportedPostIds] = useState<string[]>([]);
  const [channels, setChannels] = useState<MyChannel[]>([]);
  const [submittedPosts, setSubmittedPosts] = useState<CommPost[]>([]);
  const [stateLoaded, setStateLoaded] = useState(false);

  // Filters
  const [commFilter, setCommFilter] = useState('all');
  const [boardFilter, setBoardFilter] = useState('all');

  // Reflect/Write/Preview flow state
  const [selectedPrompt, setSelectedPrompt] = useState<typeof PROMPTS[number] | null>(null);
  const [ownPromptText, setOwnPromptText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow');
  const [selectedIcon, setSelectedIcon] = useState('⭐');
  const [showStarters, setShowStarters] = useState(false);
  const [shareOption, setShareOption] = useState<'private' | 'community'>('private');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingChannelId, setEditingChannelId] = useState<string | undefined>(undefined);

  // Sheets
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showAddPost, setShowAddPost] = useState(false);
  const [postStep, setPostStep] = useState<1 | 2 | 3>(1);
  const [postCategory, setPostCategory] = useState<CommCategory | null>(null);
  const [postText, setPostText] = useState('');
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelEmoji, setChannelEmoji] = useState(CHANNEL_EMOJIS[0]);
  const [channelCreated, setChannelCreated] = useState(false);

  useEffect(() => {
    void getCommunityState().then((state) => {
      setSavedPostIds(state.savedPostIds);
      setReportedPostIds(state.reportedPostIds);
      setChannels(state.channels);
      setSubmittedPosts(state.submittedPosts);
      setStateLoaded(true);
    });
    void getModuleCompletions().then(setCompletions);
  }, []);

  useEffect(() => {
    if (!stateLoaded) return;
    void saveCommunityState({ savedPostIds, reportedPostIds, channels, submittedPosts });
  }, [channels, reportedPostIds, savedPostIds, stateLoaded, submittedPosts]);

  useEffect(() => {
    if (resume !== '1') return;
    void getModuleDraft().then((draft) => {
      if (draft?.moduleId !== 'community-note') return;
      const state = draft.state as {
        screen?: Screen; selectedPrompt?: typeof selectedPrompt; ownPromptText?: string; noteText?: string;
        selectedColor?: NoteColor; selectedIcon?: string; shareOption?: 'private' | 'community';
      } | undefined;
      if (state?.screen) setScreen(state.screen);
      if (state) {
        setSelectedPrompt(state.selectedPrompt ?? null);
        setOwnPromptText(state.ownPromptText ?? '');
        setNoteText(state.noteText ?? '');
        setSelectedColor(state.selectedColor ?? 'yellow');
        setSelectedIcon(state.selectedIcon ?? '⭐');
        setShareOption(state.shareOption ?? 'private');
      }
    });
  }, [resume]);

  // Only the in-progress note-creation flow is resumable — Community/My Board
  // are always-available browse screens, not a wizard with a "finish" state.
  useEffect(() => {
    if (screen !== 'reflect' && screen !== 'write' && screen !== 'preview') return;
    void saveModuleDraft({
      moduleId: 'community-note',
      title: 'My Board note',
      route: '/community-flow?section=board',
      step: screen === 'reflect' ? 0 : screen === 'write' ? 1 : 2,
      totalSteps: 3,
      state: { screen, selectedPrompt, ownPromptText, noteText, selectedColor, selectedIcon, shareOption },
    });
  }, [noteText, ownPromptText, screen, selectedColor, selectedIcon, selectedPrompt, shareOption]);

  const exit = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/library');
  };

  const refreshCompletions = () => void getModuleCompletions().then(setCompletions);

  // ── Reflect → Write → Preview flow ─────────────────────────────────────
  const getPromptLabel = () => {
    if (!selectedPrompt) return '';
    if (selectedPrompt.key === 'own') return ownPromptText.trim() || 'My reflection';
    return selectedPrompt.label;
  };

  const startAddNote = (channelId?: string) => {
    setSelectedPrompt(null); setOwnPromptText(''); setNoteText('');
    setSelectedColor('yellow'); setSelectedIcon('⭐'); setShareOption('private');
    setShowStarters(false); setEditingId(null); setEditingChannelId(channelId);
    setScreen('reflect');
  };

  const startEditNote = (completion: ModuleCompletion) => {
    const metadata = completion.metadata ?? {};
    setEditingId(completion.id);
    setEditingChannelId(typeof metadata.channelId === 'string' ? metadata.channelId : undefined);
    setSelectedPrompt(PROMPTS.find((p) => p.key === metadata.promptKey) ?? PROMPTS[0]);
    setOwnPromptText(metadata.promptKey === 'own' ? completion.title : '');
    setNoteText(completion.body ?? '');
    setSelectedColor((metadata.color as NoteColor) ?? 'yellow');
    setSelectedIcon(typeof metadata.icon === 'string' ? metadata.icon : '⭐');
    setShareOption('private');
    setScreen('write');
  };

  const handleAddToBoard = async () => {
    if (!selectedPrompt || !noteText.trim()) return;
    const promptLabel = getPromptLabel();
    const trimmed = noteText.trim();
    const metadata = {
      promptKey: selectedPrompt.key as string,
      color: selectedColor as string,
      icon: selectedIcon,
      channelId: editingChannelId ?? '',
    };
    if (editingId !== null) {
      await updateModuleCompletion(editingId, { title: promptLabel, body: trimmed, metadata });
    } else {
      await recordModuleCompletion({ moduleId: 'board-note', title: promptLabel, body: trimmed, metadata });
    }
    if (shareOption === 'community') {
      setSubmittedPosts((list) => [
        {
          id: `local-${Date.now()}`,
          text: trimmed,
          color: NOTE_COLOR_ORDER[Math.floor(Math.random() * NOTE_COLOR_ORDER.length)],
          category: 'notjustme',
          timestamp: 'Just now',
        },
        ...list,
      ]);
    }
    setEditingId(null);
    setEditingChannelId(undefined);
    await clearModuleDraft('community-note');
    refreshCompletions();
    setScreen('board');
  };

  const handleDeleteNote = async (id: number) => {
    await deleteModuleCompletion(id);
    setDeleteTarget(null);
    refreshCompletions();
  };

  // ── Community ────────────────────────────────────────────────────────────
  const allPosts = [...submittedPosts, ...SEED_POSTS].filter((post) => !reportedPostIds.includes(post.id));
  const filteredComm = commFilter === 'all' ? interleaveByCategory(allPosts) : allPosts.filter((post) => post.category === commFilter);

  const toggleSave = (postId: string) => setSavedPostIds((list) => (list.includes(postId) ? list.filter((id) => id !== postId) : [...list, postId]));
  const confirmReport = () => {
    if (reportTarget) setReportedPostIds((list) => [...list, reportTarget]);
    setReportTarget(null);
  };

  const openAddPost = () => { setPostStep(1); setPostCategory(null); setPostText(''); setPostSubmitted(false); setShowAddPost(true); };
  const closeAddPost = () => { setShowAddPost(false); setPostSubmitted(false); };
  const submitPost = () => {
    if (!postCategory || !postText.trim()) return;
    setSubmittedPosts((list) => [
      {
        id: `local-${Date.now()}`,
        text: postText.trim(),
        color: NOTE_COLOR_ORDER[Math.floor(Math.random() * NOTE_COLOR_ORDER.length)],
        category: postCategory,
        timestamp: 'Just now',
      },
      ...list,
    ]);
    setPostSubmitted(true);
  };

  // ── My Board ─────────────────────────────────────────────────────────────
  const boardNotes = completions.filter((c) => c.moduleId === 'board-note');
  const legacyCompletions = completions.filter((c) => c.moduleId in BOARD_MODULES);
  const savedPosts = [...submittedPosts, ...SEED_POSTS].filter((post) => savedPostIds.includes(post.id));
  const isSavedTab = boardFilter === 'saved';
  const isCustomChannel = channels.some((c) => c.id === boardFilter);
  const activeChannel = channels.find((c) => c.id === boardFilter);

  const matchesPromptFilter = (promptKey: unknown, filterId: string) => {
    if (filterId === 'like') return promptKey === 'like' || promptKey === 'mattered';
    return promptKey === filterId;
  };
  const filteredBoardNotes = boardNotes.filter((note) => {
    const metadata = note.metadata ?? {};
    const channelId = typeof metadata.channelId === 'string' && metadata.channelId ? metadata.channelId : undefined;
    if (isCustomChannel) return channelId === boardFilter;
    if (boardFilter === 'all') return !channelId;
    return !channelId && matchesPromptFilter(metadata.promptKey, boardFilter);
  });
  const filteredLegacy = (!isCustomChannel && boardFilter === 'all')
    ? legacyCompletions
    : legacyCompletions.filter((c) => !isCustomChannel && BOARD_MODULES[c.moduleId].filterId === boardFilter);

  const createChannel = () => {
    if (!channelName.trim()) return;
    setChannels((list) => [...list, { id: `ch-${Date.now()}`, name: channelName.trim(), emoji: channelEmoji }]);
    setChannelCreated(true);
  };
  const openCreateChannel = () => { setChannelName(''); setChannelEmoji(CHANNEL_EMOJIS[0]); setChannelCreated(false); setShowCreateChannel(true); };

  const back = () => {
    if (screen === 'reflect') { void clearModuleDraft('community-note'); setScreen('board'); }
    else if (screen === 'write') setScreen('reflect');
    else if (screen === 'preview') setScreen('write');
    else exit();
  };
  const shell = (title: string, children: ReactNode, middle?: ReactNode) => (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlowHeader title={middle ? undefined : title} middle={middle} onBack={back} onClose={screen === 'community' || screen === 'board' ? undefined : back} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </View>
  );

  if (screen === 'reflect') {
    const canContinue = selectedPrompt && (selectedPrompt.key !== 'own' || ownPromptText.trim());
    return shell('Reflect', <>
      <Heading style={styles.question}>What would you like to reflect on?</Heading>
      <View style={styles.promptGrid}>
        {PROMPTS.map((prompt) => {
          const active = selectedPrompt?.key === prompt.key;
          return (
            <Pressable key={prompt.key} onPress={() => setSelectedPrompt(prompt)} style={[styles.promptCard, active && styles.promptCardOn]}>
              <Text style={styles.promptEmoji}>{prompt.emoji}</Text>
              <Text style={styles.promptLabel}>{prompt.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {selectedPrompt?.key === 'own' ? (
        <TextInput value={ownPromptText} onChangeText={setOwnPromptText} placeholder="What would you like to reflect on?" placeholderTextColor={Palette.neutral600} style={styles.plainInput} />
      ) : null}
      <Btn label="Continue →" disabled={!canContinue} onPress={() => setScreen('write')} style={!canContinue ? styles.disabled : undefined} />
    </>);
  }

  if (screen === 'write') {
    const canContinue = noteText.trim().length > 0;
    const colors = noteColorTokens(selectedColor);
    return shell('Write', <>
      <View style={styles.promptBanner}>
        <Text style={styles.promptBannerKicker}>Your prompt</Text>
        <Heading style={styles.promptBannerText}>&quot;{getPromptLabel()}&quot;</Heading>
      </View>
      <Text style={styles.kicker}>WHAT WOULD YOU LIKE TO ADD?</Text>
      <View style={[styles.noteComposer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={styles.noteComposerIcon}>{selectedIcon}</Text>
        <TextInput value={noteText} onChangeText={setNoteText} placeholder="It can be something big or small…" placeholderTextColor={Palette.neutral600} multiline maxLength={280} style={styles.noteComposerInput} />
        <Text style={styles.charCount}>{noteText.length}/280</Text>
      </View>
      <View style={styles.pickerRow}>
        <View style={styles.colorRow}>
          {NOTE_COLOR_ORDER.map((c) => (
            <Pressable key={c} onPress={() => setSelectedColor(c)} style={[styles.colorDot, { backgroundColor: noteColorTokens(c).bg, borderColor: selectedColor === c ? Palette.accent700 : noteColorTokens(c).border }, selectedColor === c && styles.colorDotOn]} />
          ))}
        </View>
        <View style={styles.iconRow}>
          {NOTE_ICONS.map((icon) => (
            <Pressable key={icon} onPress={() => setSelectedIcon(icon)} style={[styles.iconChip, selectedIcon === icon && styles.iconChipOn]}>
              <Text style={styles.iconChipText}>{icon}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Btn label={showStarters ? 'Hide ideas' : 'Need help? ✨'} variant="ghost" onPress={() => setShowStarters((v) => !v)} />
      {showStarters ? (
        <View style={styles.ideaBox}>
          {STARTERS.map((starter) => (
            <Pressable key={starter} onPress={() => { setNoteText((t) => (t ? `${t} ${starter}` : starter)); setShowStarters(false); }} style={styles.starterRow}>
              <Text style={styles.starterText}>{starter}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Btn label="Preview →" disabled={!canContinue} onPress={() => setScreen('preview')} style={!canContinue ? styles.disabled : undefined} />
    </>);
  }

  if (screen === 'preview') {
    const colors = noteColorTokens(selectedColor);
    return shell('Preview', <>
      <View style={[styles.previewCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <View style={styles.previewTopRow}>
          <Text style={styles.previewKicker}>{getPromptLabel().toUpperCase()}</Text>
          <Text style={styles.previewIcon}>{selectedIcon}</Text>
        </View>
        <Text style={styles.previewText}>{noteText}</Text>
        <Text style={styles.previewDate}>Just now</Text>
      </View>
      <Heading style={styles.question}>Where would you like to add this?</Heading>
      {(['private', 'community'] as const).map((opt) => (
        <Pressable key={opt} onPress={() => setShareOption(opt)} style={[styles.shareOption, shareOption === opt && styles.shareOptionOn]}>
          <View style={[styles.radio, shareOption === opt && styles.radioOn]}>{shareOption === opt ? <View style={styles.radioDot} /> : null}</View>
          <Text style={styles.body}>{opt === 'private' ? 'My private board' : 'My private board and the anonymous community wall'}</Text>
        </Pressable>
      ))}
      <View style={styles.disclosureBox}>
        <Text style={styles.disclosureText}>
          Your name and profile will never appear on the community wall.
          {shareOption === 'community' ? <Text style={styles.disclosureEmphasis}> Your note will be reviewed before other people can see it.</Text> : null}
        </Text>
      </View>
      <Btn label="Add to board" onPress={handleAddToBoard} />
      <View style={styles.rowGap}>
        <Btn label="Edit" variant="secondary" onPress={() => setScreen('write')} style={styles.flex1} />
        <Btn label="Not now" variant="secondary" onPress={() => setScreen('board')} style={styles.flex1} />
      </View>
    </>);
  }

  const segmented = (
    <View style={styles.segmentRow}>
      <Pressable onPress={() => setScreen('community')} style={[styles.segmentBtn, screen === 'community' && styles.segmentBtnOn]}>
        <Text style={[styles.segmentLabel, screen === 'community' && styles.segmentLabelOn]}>Community</Text>
      </Pressable>
      <Pressable onPress={() => setScreen('board')} style={[styles.segmentBtn, screen === 'board' && styles.segmentBtnOn]}>
        <Text style={[styles.segmentLabel, screen === 'board' && styles.segmentLabelOn]}>My Board</Text>
      </Pressable>
    </View>
  );

  if (screen === 'community') {
    return (
      <>
        {shell('Community', <>
          {segmented}
          <Heading style={styles.title}>Community Board</Heading>
          <Text style={styles.subtitle}>See what other people are sharing about comparison: what gets to them, what&apos;s helped, and what they wish more people talked about.</Text>
          <View style={styles.filterRow}>
            {COMM_FILTERS.map((f) => (
              <Pressable key={f.id} onPress={() => setCommFilter(f.id)} style={[styles.filterChip, commFilter === f.id && styles.filterChipOn]}>
                <Text style={[styles.filterChipText, commFilter === f.id && styles.filterChipTextOn]}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
          {filteredComm.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>🌱</Text><Text style={styles.emptyText}>Nothing here yet. Check back soon.</Text></View>
          ) : (
            <View style={styles.postList}>
              {filteredComm.map((post) => (
                <CommunityPostCard key={post.id} post={post} isSaved={savedPostIds.includes(post.id)} onToggleSave={() => toggleSave(post.id)} onReport={() => setReportTarget(post.id)} />
              ))}
            </View>
          )}
          <View style={{ height: 90 }} />
        </>)}
        <Pressable onPress={openAddPost} style={styles.fab}><Text style={styles.fabLabel}>+ Add a Post</Text></Pressable>

        <ConfirmSheet
          visible={!!reportTarget}
          title="Report this post?"
          body="It'll be reviewed by a moderator. Thanks for helping keep this space safe."
          confirmLabel="Report"
          onCancel={() => setReportTarget(null)}
          onConfirm={confirmReport}
        />

        <Sheet visible={showAddPost} onClose={closeAddPost}>
          {postSubmitted ? (
            <SheetSuccess emoji="🎉" title="Post submitted!" body="Your post will be reviewed before it shows up. Usually takes less than a day." onDone={closeAddPost} />
          ) : postStep === 1 ? (
            <View style={styles.sheetBody}>
              <SheetHeader title="Share something" onClose={closeAddPost} />
              <Text style={styles.body}>What kind of thing do you want to share?</Text>
              {COMM_CATEGORIES.map((cat) => (
                <Pressable key={cat.id} onPress={() => { setPostCategory(cat.id); setPostStep(2); }} style={styles.categoryOption}>
                  <Text style={styles.categoryOptionEmoji}>{cat.emoji}</Text>
                  <View style={styles.flex1}>
                    <Text style={styles.categoryOptionLabel}>{cat.label}</Text>
                    <Text style={styles.categoryOptionDesc}>{cat.desc}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : postStep === 2 ? (
            <View style={styles.sheetBody}>
              <SheetHeader title={postCategory ? CATEGORY_LABEL[postCategory] : ''} onBack={() => setPostStep(1)} onClose={closeAddPost} />
              <Text style={styles.kicker}>WHAT DO YOU WANT TO SAY?</Text>
              <TextInput value={postText} onChangeText={setPostText} multiline maxLength={300} placeholder="Something that's helped you…" placeholderTextColor={Palette.neutral600} style={styles.input} />
              <Text style={styles.charCount}>{postText.length}/300</Text>
              <Btn label="Next →" disabled={!postText.trim()} onPress={() => setPostStep(3)} style={!postText.trim() ? styles.disabled : undefined} />
            </View>
          ) : (
            <View style={styles.sheetBody}>
              <SheetHeader title="Before you post" onBack={() => setPostStep(2)} onClose={closeAddPost} />
              <Text style={styles.safeguardEmoji}>👀</Text>
              <Heading style={styles.safeguardTitle}>Other people in the app can see this</Heading>
              <View style={styles.safeguardBox}>
                <Text style={styles.safeguardText}>Make sure you&apos;re comfortable sharing it, and keep it helpful and respectful. You&apos;re adding to a space where people come when things feel hard — what you say matters. 💛</Text>
              </View>
              {postCategory ? (
                <View style={[styles.previewMini, { backgroundColor: noteColorTokens('mint').bg, borderColor: noteColorTokens('mint').border }]}>
                  <Text style={styles.previewMiniLabel}>{CATEGORY_LABEL[postCategory]}</Text>
                  <Text style={styles.previewMiniText}>&quot;{postText}&quot;</Text>
                </View>
              ) : null}
              <Btn label="Looks good — post it" onPress={submitPost} />
              <Btn label="Go back and edit" variant="secondary" onPress={() => setPostStep(2)} />
            </View>
          )}
        </Sheet>
      </>
    );
  }

  // screen === 'board'
  const allFilters = [...BOARD_FILTERS, ...channels.map((c) => ({ id: c.id, label: `${c.emoji} ${c.name}` })), { id: 'saved', label: '⭐ Saved' }];
  return (
    <>
      {shell('My Board', <>
        {segmented}
        <Heading style={styles.title}>My Board</Heading>
        <Text style={styles.subtitleMuted}>Your stuff, all in one place. Wins, reflections, saved thoughts, and things you&apos;ve shared will show up here.</Text>
        <View style={styles.filterRow}>
          {allFilters.map((f) => (
            <Pressable key={f.id} onPress={() => setBoardFilter(f.id)} style={[styles.filterChipAlt, boardFilter === f.id && styles.filterChipAltOn]}>
              <Text style={[styles.filterChipText, boardFilter === f.id && styles.filterChipTextOn]}>{f.label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={openCreateChannel} style={styles.addChannelBtn}><Text style={styles.addChannelLabel}>+</Text></Pressable>
        </View>

        {isSavedTab ? (
          savedPosts.length === 0 ? (
            <View style={styles.emptyState}><Text style={styles.emptyEmoji}>⭐</Text><Text style={styles.emptyText}>Tap the star on any community post to save it here.</Text></View>
          ) : (
            <View style={styles.cardGrid}>
              {savedPosts.map((post) => <SavedPostCard key={post.id} post={post} onUnsave={() => toggleSave(post.id)} />)}
            </View>
          )
        ) : (filteredBoardNotes.length === 0 && filteredLegacy.length === 0) ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{isCustomChannel ? activeChannel?.emoji : '✨'}</Text>
            <Text style={styles.emptyText}>{isCustomChannel ? `Nothing in ${activeChannel?.name} yet. Add a note and it'll show up here.` : "Nothing here yet — add your first note!"}</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {filteredBoardNotes.map((note) => (
              <PostIt key={note.id} note={note} onEdit={() => startEditNote(note)} onDelete={() => setDeleteTarget(note.id)} />
            ))}
            {filteredLegacy.map((completion, index) => (
              <View key={`${completion.moduleId}-${completion.completedAt}-${index}`} style={styles.legacyCard}>
                <Text style={styles.legacyIcon}>{BOARD_MODULES[completion.moduleId].icon}</Text>
                <Text style={styles.legacyLabel}>{BOARD_MODULES[completion.moduleId].label}</Text>
                <Text style={styles.legacyBody}>{completion.body || BOARD_MODULES[completion.moduleId].label}</Text>
                <Text style={styles.legacyDate}>{formatRelativeDate(completion.completedAt)}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 90 }} />
      </>)}
      {!isSavedTab ? <Pressable onPress={() => startAddNote(isCustomChannel ? boardFilter : undefined)} style={styles.fabAlt}><Text style={styles.fabLabel}>+ Add a note</Text></Pressable> : null}

      <ConfirmSheet
        visible={deleteTarget !== null}
        title="Remove this note?"
        body="This can't be undone."
        confirmLabel="Remove"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget !== null) void handleDeleteNote(deleteTarget); }}
      />

      <Sheet visible={showCreateChannel} onClose={() => setShowCreateChannel(false)}>
        {channelCreated ? (
          <SheetSuccess emoji={channelEmoji} title="Board created!" body={`${channelEmoji} ${channelName} is ready. Tap it in the tabs, then add notes to fill it up.`} onDone={() => setShowCreateChannel(false)} />
        ) : (
          <View style={styles.sheetBody}>
            <SheetHeader title="Create a board" onClose={() => setShowCreateChannel(false)} />
            <Text style={styles.body}>Create a personal board to organize your notes however makes sense to you.</Text>
            <Text style={styles.kicker}>PICK AN ICON</Text>
            <View style={styles.emojiGrid}>
              {CHANNEL_EMOJIS.map((e) => (
                <Pressable key={e} onPress={() => setChannelEmoji(e)} style={[styles.emojiOption, channelEmoji === e && styles.emojiOptionOn]}>
                  <Text style={styles.emojiOptionText}>{e}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.kicker}>NAME YOUR BOARD</Text>
            <TextInput value={channelName} onChangeText={setChannelName} placeholder="e.g. Things I'm proud of, Good days…" maxLength={40} placeholderTextColor={Palette.neutral600} style={styles.plainInput} />
            <Btn label="Create board" disabled={!channelName.trim()} onPress={createChannel} style={!channelName.trim() ? styles.disabled : undefined} />
          </View>
        )}
      </Sheet>
    </>
  );
}

// ─── Shared sheet primitives ────────────────────────────────────────────────

function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHandle} />
        {children}
      </View>
    </Modal>
  );
}

function SheetHeader({ title, onBack, onClose }: { title: string; onBack?: () => void; onClose: () => void }) {
  return (
    <View style={styles.sheetHeaderRow}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.sheetIconBtn}><Text style={styles.sheetIconBtnText}>←</Text></Pressable>
      ) : <View style={styles.sheetIconBtn} />}
      <Heading style={styles.sheetTitle}>{title}</Heading>
      <Pressable onPress={onClose} style={styles.sheetIconBtn}><Text style={styles.sheetIconBtnText}>✕</Text></Pressable>
    </View>
  );
}

function SheetSuccess({ emoji, title, body, onDone }: { emoji: string; title: string; body: string; onDone: () => void }) {
  return (
    <View style={styles.sheetSuccess}>
      <Text style={styles.sheetSuccessEmoji}>{emoji}</Text>
      <Heading style={styles.sheetSuccessTitle}>{title}</Heading>
      <Text style={styles.sheetSuccessBody}>{body}</Text>
      <Btn label="Done" onPress={onDone} />
    </View>
  );
}

function ConfirmSheet({ visible, title, body, confirmLabel, onCancel, onConfirm }: {
  visible: boolean; title: string; body: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.confirmBackdrop} onPress={onCancel}>
        <Pressable style={styles.confirmCard} onPress={(e) => e.stopPropagation()}>
          <Heading style={styles.confirmTitle}>{title}</Heading>
          <Text style={styles.confirmBody}>{body}</Text>
          <View style={styles.rowGap}>
            <Btn label="Cancel" variant="secondary" onPress={onCancel} style={styles.flex1} />
            <Btn label={confirmLabel} onPress={onConfirm} style={styles.flex1} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Cards ──────────────────────────────────────────────────────────────────

/** Standard default profile icon — same treatment for every post, no per-user variation. */
function Avatar({ size = 28 }: { size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="person" size={Math.round(size * 0.55)} color={Palette.neutral600} />
    </View>
  );
}

function CommunityPostCard({ post, isSaved, onToggleSave, onReport }: { post: CommPost; isSaved: boolean; onToggleSave: () => void; onReport: () => void }) {
  const colors = noteColorTokens(post.color);
  const badge = categoryBadgeTokens(post.category);
  return (
    <View style={[styles.postCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.postTopRow}>
        <Avatar size={26} />
        <View style={[styles.postBadge, { backgroundColor: badge.bg }]}><Text style={[styles.postBadgeText, { color: badge.text }]}>{CATEGORY_LABEL[post.category]}</Text></View>
        <Text style={styles.postTimestamp}>{post.timestamp}</Text>
        <Pressable onPress={onReport} hitSlop={8}><Text style={styles.postFlag}>⚑</Text></Pressable>
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      <Pressable onPress={onToggleSave} hitSlop={8} style={styles.postStarBtn}>
        <Text style={[styles.postStarText, isSaved && styles.postStarTextOn]}>{isSaved ? '★' : '☆'}</Text>
      </Pressable>
    </View>
  );
}

function SavedPostCard({ post, onUnsave }: { post: CommPost; onUnsave: () => void }) {
  const colors = noteColorTokens(post.color);
  const badge = categoryBadgeTokens(post.category);
  return (
    <View style={[styles.savedCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.postTopRow}>
        <Avatar size={22} />
        <View style={[styles.postBadge, { backgroundColor: badge.bg }]}><Text style={[styles.postBadgeText, { color: badge.text }]}>{CATEGORY_LABEL[post.category]}</Text></View>
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      <Pressable onPress={onUnsave} hitSlop={8} style={styles.postStarBtn}><Text style={[styles.postStarText, styles.postStarTextOn]}>★</Text></Pressable>
    </View>
  );
}

function PostIt({ note, onEdit, onDelete }: { note: ModuleCompletion; onEdit: () => void; onDelete: () => void }) {
  const metadata = note.metadata ?? {};
  const color = (metadata.color as NoteColor) ?? 'yellow';
  const colors = noteColorTokens(color);
  const icon = typeof metadata.icon === 'string' ? metadata.icon : '⭐';
  return (
    <View style={[styles.postIt, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.postItTopRow}>
        <Avatar size={20} />
        <Text style={styles.postItPrompt}>{note.title}</Text>
        <Text style={styles.postItIcon}>{icon}</Text>
      </View>
      <Text style={styles.postItBody}>{note.body}</Text>
      <Text style={styles.postItDate}>{formatRelativeDate(note.completedAt)}</Text>
      <View style={styles.postItActions}>
        <Pressable onPress={onEdit} hitSlop={6} style={styles.postItActionBtn}><Text style={styles.postItActionText}>✎</Text></Pressable>
        <Pressable onPress={onDelete} hitSlop={6} style={styles.postItActionBtn}><Text style={styles.postItActionText}>🗑</Text></Pressable>
      </View>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  screen: { flex: 1, backgroundColor: Palette.bg },
  content: { padding: 20, paddingTop: 10, gap: 14 },
  body: { color: Palette.text, fontSize: 14.5, lineHeight: 21 },
  kicker: { color: Palette.accent2_700, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginTop: 4 },
  question: { fontSize: 20, color: Palette.text, lineHeight: 26 },
  flex1: { flex: 1 },
  rowGap: { flexDirection: 'row', gap: 10 },
  disabled: { opacity: 0.4 },

  segmentRow: { flexDirection: 'row', backgroundColor: Palette.neutral200, borderRadius: Radius.pill, padding: 4, marginBottom: 4 },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.pill },
  segmentBtnOn: { backgroundColor: Palette.neutral100, boxShadow: Shadow.elevSm },
  segmentLabel: { fontSize: 13, fontWeight: '700', color: Palette.neutral600 },
  segmentLabelOn: { color: Palette.accent700 },

  title: { fontSize: 24, color: Palette.text },
  subtitle: { color: Palette.neutral700, fontSize: 13, lineHeight: 19 },
  subtitleMuted: { color: Palette.neutral600, fontSize: 12.5, lineHeight: 18 },

  avatar: { backgroundColor: Palette.neutral200, alignItems: 'center', justifyContent: 'center' },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  filterChip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.pill, backgroundColor: Palette.neutral200 },
  filterChipOn: { backgroundColor: Palette.accent2_700 },
  filterChipAlt: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.pill, backgroundColor: Palette.neutral200 },
  filterChipAltOn: { backgroundColor: Palette.accent700 },
  filterChipText: { fontSize: 12, fontWeight: '700', color: Palette.neutral700 },
  filterChipTextOn: { color: Palette.bg },
  addChannelBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.neutral200 },
  addChannelLabel: { fontSize: 16, fontWeight: '700', color: Palette.neutral700 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 13.5, color: Palette.neutral600, textAlign: 'center', maxWidth: 260 },

  postList: { gap: 12 },
  postCard: { borderRadius: Radius.lg, borderWidth: 2, padding: 14, paddingBottom: 30, boxShadow: Shadow.elevSm, gap: 8 },
  postTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postBadge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: Radius.pill },
  postBadgeText: { fontSize: 10, fontWeight: '700' },
  postTimestamp: { fontSize: 10.5, color: Palette.neutral600, marginLeft: 'auto' },
  postFlag: { fontSize: 13, color: Palette.neutral600 },
  postText: { fontSize: 13.5, color: Palette.text, lineHeight: 20, fontWeight: '600' },
  postStarBtn: { position: 'absolute', bottom: 10, right: 12 },
  postStarText: { fontSize: 18, color: Palette.neutral600 },
  postStarTextOn: { color: Palette.accent700 },

  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  savedCard: { width: '48%', borderRadius: Radius.lg, borderWidth: 2, padding: 12, paddingBottom: 28, gap: 6, boxShadow: Shadow.elevSm },
  legacyCard: { width: '48%', backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300, padding: 12, gap: 4, boxShadow: Shadow.elevSm },
  legacyIcon: { fontSize: 18 },
  legacyLabel: { fontSize: 11, fontWeight: '700', color: Palette.accent2_700 },
  legacyBody: { fontSize: 12.5, color: Palette.text, lineHeight: 17 },
  legacyDate: { fontSize: 10.5, color: Palette.neutral600 },

  postIt: { width: '48%', borderRadius: Radius.sm, borderWidth: 1, padding: 10, paddingBottom: 26, gap: 6, boxShadow: Shadow.elevSm },
  postItTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postItPrompt: { flex: 1, fontSize: 9.5, fontWeight: '700', color: Palette.neutral700 },
  postItIcon: { fontSize: 14 },
  postItBody: { fontSize: 12, color: Palette.text, lineHeight: 17, fontWeight: '600' },
  postItDate: { fontSize: 10, color: Palette.neutral600 },
  postItActions: { position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', gap: 4 },
  postItActionBtn: { width: 20, height: 20, borderRadius: 10, backgroundColor: Palette.neutral100, alignItems: 'center', justifyContent: 'center' },
  postItActionText: { fontSize: 10 },

  fab: { position: 'absolute', bottom: 24, alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 22, borderRadius: Radius.pill, backgroundColor: Palette.accent2_700, boxShadow: Shadow.lg },
  fabAlt: { position: 'absolute', bottom: 24, alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 22, borderRadius: Radius.pill, backgroundColor: Palette.accent700, boxShadow: Shadow.lg },
  fabLabel: { color: Palette.bg, fontWeight: '700', fontSize: 14 },

  // Reflect
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  promptCard: { width: '47%', padding: 14, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, borderWidth: 2, borderColor: Palette.neutral300, gap: 6 },
  promptCardOn: { borderColor: Palette.accent700, backgroundColor: Palette.accent100 },
  promptEmoji: { fontSize: 20 },
  promptLabel: { fontSize: 12.5, fontWeight: '700', color: Palette.text },
  plainInput: { borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, padding: 12, color: Palette.text, boxShadow: Shadow.elevSm },

  // Write
  promptBanner: { backgroundColor: Palette.accent100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.accent200, padding: 14, gap: 2 },
  promptBannerKicker: { fontSize: 11.5, fontWeight: '700', color: Palette.accent700 },
  promptBannerText: { fontSize: 15, color: Palette.text },
  noteComposer: { borderRadius: Radius.lg, borderWidth: 2, padding: 14, minHeight: 150, gap: 4 },
  noteComposerIcon: { position: 'absolute', top: 10, right: 12, fontSize: 22 },
  noteComposerInput: { minHeight: 110, fontSize: 14, color: Palette.text, fontWeight: '600', paddingRight: 24 },
  charCount: { fontSize: 10, color: Palette.neutral600, textAlign: 'right' },
  pickerRow: { gap: 10 },
  colorRow: { flexDirection: 'row', gap: 8 },
  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2 },
  colorDotOn: { borderWidth: 2.5 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  iconChip: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  iconChipOn: { backgroundColor: Palette.accent100, borderColor: Palette.accent700 },
  iconChipText: { fontSize: 15 },
  ideaBox: { backgroundColor: Palette.accent100, borderRadius: Radius.lg, padding: 10, gap: 6 },
  starterRow: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: Radius.sm, backgroundColor: Palette.neutral100 },
  starterText: { fontSize: 12.5, fontWeight: '600', color: Palette.accent700 },

  // Preview
  previewCard: { borderRadius: Radius.xl, borderWidth: 2, padding: 20, minHeight: 160, gap: 10, boxShadow: Shadow.lg },
  previewTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  previewKicker: { fontSize: 10.5, fontWeight: '700', color: Palette.neutral600, letterSpacing: 0.5 },
  previewIcon: { fontSize: 26 },
  previewText: { fontSize: 15, fontWeight: '700', color: Palette.text, lineHeight: 21 },
  previewDate: { fontSize: 11, color: Palette.neutral600 },
  shareOption: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, borderWidth: 2, borderColor: Palette.neutral300 },
  shareOptionOn: { borderColor: Palette.accent700, backgroundColor: Palette.accent100 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Palette.neutral300, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioOn: { borderColor: Palette.accent700 },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: Palette.accent700 },
  disclosureBox: { backgroundColor: Palette.neutral200, borderRadius: Radius.sm, padding: 12 },
  disclosureText: { fontSize: 11.5, color: Palette.neutral700, lineHeight: 17 },
  disclosureEmphasis: { fontWeight: '700', color: Palette.accent700 },

  // Sheets — scrim derived from the theme's own darkest neutral, not a foreign color
  sheetBackdrop: { flex: 1, backgroundColor: `${Palette.neutral800}66` },
  sheetContainer: { backgroundColor: Palette.bg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, maxHeight: '82%', paddingBottom: 24 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Palette.neutral300, marginTop: 10, marginBottom: 4 },
  sheetBody: { paddingHorizontal: 20, paddingTop: 10, gap: 12 },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetIconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.neutral200 },
  sheetIconBtnText: { fontSize: 13, color: Palette.neutral700, fontWeight: '700' },
  sheetTitle: { fontSize: 17, color: Palette.text },
  sheetSuccess: { alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 28 },
  sheetSuccessEmoji: { fontSize: 40 },
  sheetSuccessTitle: { fontSize: 19, color: Palette.text, textAlign: 'center' },
  sheetSuccessBody: { fontSize: 13.5, color: Palette.neutral700, textAlign: 'center', lineHeight: 20, marginBottom: 6 },

  categoryOption: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, borderWidth: 2, borderColor: Palette.neutral300 },
  categoryOptionEmoji: { fontSize: 22 },
  categoryOptionLabel: { fontSize: 14, fontWeight: '700', color: Palette.text },
  categoryOptionDesc: { fontSize: 12, color: Palette.neutral600 },

  input: { minHeight: 100, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.lg, backgroundColor: Palette.neutral100, padding: 14, color: Palette.text, textAlignVertical: 'top', boxShadow: Shadow.elevSm },

  safeguardEmoji: { fontSize: 34, textAlign: 'center' },
  safeguardTitle: { fontSize: 18, textAlign: 'center', color: Palette.text, lineHeight: 24 },
  safeguardBox: { backgroundColor: Palette.accent100, borderRadius: Radius.lg, padding: 14 },
  safeguardText: { fontSize: 12.5, color: Palette.accent800, textAlign: 'center', lineHeight: 18 },
  previewMini: { borderRadius: Radius.lg, borderWidth: 1.5, padding: 12, gap: 4 },
  previewMiniLabel: { fontSize: 11, fontWeight: '700', color: Palette.accent2_700 },
  previewMiniText: { fontSize: 12.5, color: Palette.text, lineHeight: 18 },

  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOption: { width: 38, height: 38, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.neutral200, borderWidth: 2, borderColor: 'transparent' },
  emojiOptionOn: { backgroundColor: Palette.accent100, borderColor: Palette.accent700 },
  emojiOptionText: { fontSize: 17 },

  confirmBackdrop: { flex: 1, backgroundColor: `${Palette.neutral800}66`, justifyContent: 'flex-end', padding: 16 },
  confirmCard: { backgroundColor: Palette.bg, borderRadius: Radius.xl, padding: 20, gap: 10, boxShadow: Shadow.lg },
  confirmTitle: { fontSize: 16, color: Palette.text },
  confirmBody: { fontSize: 13, color: Palette.neutral700, lineHeight: 19, marginBottom: 4 },
}));
