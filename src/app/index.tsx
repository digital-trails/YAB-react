import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Card,
  CardRail,
  DecorCircle,
  DotTexture,
  IconAvatar,
  PillButton,
  ProgressBar,
  Tag,
  tintColors,
} from '@/components/ui/primitives';
import { AppText } from '@/components/ui/text';
import {
  Colors,
  FontFamily,
  FontSize,
  Mixed,
  Radii,
  SelectedFill,
  Spacing,
  shadow,
} from '@/constants/tokens';
import { MOOD_OPTIONS, sampleContentRepository, type Mood } from '@/data/content';

// Placeholder until accounts exist. Sample content per the handoff.
const USER_NAME = 'Maya';

function greeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const [mood, setMood] = useState<Mood | null>(null);

  const now = new Date();
  const dateLine = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const weekly = sampleContentRepository.getWeeklyStats();
  const inProgress = sampleContentRepository.getInProgressModule();
  const recommendations = sampleContentRepository.getRecommendations();
  const moodNote = MOOD_OPTIONS.find((m) => m.key === mood)?.note;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Greeting */}
      <View>
        <AppText variant="title">
          {greeting(now.getHours())}, {USER_NAME}
        </AppText>
        <AppText variant="subtitle" style={styles.dateLine}>
          {dateLine}
        </AppText>
      </View>

      {/* Mood check-in */}
      <Card loose style={styles.moodCard}>
        <DecorCircle size={100} color={Mixed.moodCardCircle} style={styles.moodCircle} />
        <AppText variant="kicker">Every day</AppText>
        <AppText variant="body">How are you feeling about social media today?</AppText>
        <View style={styles.moodRow}>
          {MOOD_OPTIONS.map((option) => {
            const active = mood === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setMood(option.key)}
                style={[styles.moodPill, active ? styles.moodPillActive : null]}>
                {/* Selected label is --color-text, not the design's --color-bg,
                    which measures 3.03:1 on the accent fill. See SelectedFill. */}
                <AppText
                  style={styles.moodPillLabel}
                  color={active ? SelectedFill.label : Colors.text}>
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        {moodNote ? <AppText variant="note">{moodNote}</AppText> : null}
      </Card>

      {/* Primary CTA */}
      <View style={[styles.hero, shadow('lg')]}>
        <DecorCircle size={150} color={Mixed.heroCircleStrong} style={styles.heroCircleTop} />
        <DecorCircle size={90} color={Mixed.heroCircleSoft} style={styles.heroCircleBottom} />
        <AppText variant="kicker" color={Colors.accent2100}>
          In the moment
        </AppText>
        <AppText variant="heroTitle">Need support right now?</AppText>
        <AppText variant="note" color={Mixed.heroBodyText}>
          A 3-minute reset for in-the-moment comparison spirals.
        </AppText>
        {/*
          Deliberate deviation: the design specifies .btn-secondary here, which
          on this dark card is 2.57:1 — below WCAG AA on the app's primary
          "I need help now" CTA. See the `onDark` variant in primitives.tsx for
          the measurements and why no stock variant works. Raise with the designer.

          TODO: no exercise player exists yet — that flow is not in this design pass.
        */}
        <PillButton label="▶  Begin · 3 min" variant="onDark" style={styles.heroButton} />
      </View>

      {/* Continue your practice */}
      {inProgress ? (
        <View>
          <AppText variant="sectionLabel" style={styles.sectionLabel}>
            Continue your practice
          </AppText>
          <Card style={styles.resumeCard}>
            <IconAvatar letter={inProgress.title[0]} tint="accent2" size={44} />
            <View style={styles.resumeBody}>
              <AppText variant="body" style={styles.resumeTitle}>
                {inProgress.title}
              </AppText>
              <ProgressBar percent={inProgress.percent} />
            </View>
            {/* TODO: module player not yet designed. */}
            <PillButton label="Resume" variant="ghost" />
          </Card>
        </View>
      ) : null}

      {/* This week */}
      <View>
        <AppText variant="sectionLabel" style={styles.sectionLabel}>
          This week
        </AppText>
        <View style={styles.statRow}>
          <StatCard value={String(weekly.dayStreak)} caption="day streak" tint="accent" />
          <StatCard value={String(weekly.sessions)} caption="sessions" tint="accent2" />
          <StatCard
            value={String(weekly.minutesPracticed)}
            caption="min practiced"
            tint="neutral"
          />
        </View>
      </View>

      {/* Recommended */}
      <View>
        <AppText variant="sectionLabel" style={styles.sectionLabel}>
          Recommended for you
        </AppText>
        <CardRail style={styles.recScroll} contentContainerStyle={styles.recContent}>
          {recommendations.map((rec) => {
            const colors = tintColors(rec.tint);
            return (
              <Card key={rec.id} style={[styles.recCard, { backgroundColor: colors.card }]}>
                <Tag
                  label={rec.kind === 'moment' ? 'In the moment' : 'Skills'}
                  tint={rec.kind === 'moment' ? 'accent' : 'accent2'}
                />
                <AppText variant="rowTitle" style={styles.recTitle}>
                  {rec.title}
                </AppText>
                <AppText variant="meta" style={styles.recDuration}>
                  {rec.durationMinutes} min
                </AppText>
              </Card>
            );
          })}
        </CardRail>
      </View>

      {/*
        Crisis entry point. Deliberately non-functional for now: the handoff
        calls this "functionally critical, not decorative", and wiring it needs
        real, region-correct crisis numbers. Rendering a tappable affordance
        that goes nowhere would be worse than one that is visibly inert.
        TODO: wire to real crisis resources before any user-facing build.
      */}
      <View style={styles.crisisBanner}>
        <View style={styles.crisisDot} />
        <View style={styles.crisisBody}>
          <AppText style={styles.crisisTitle} color={Colors.accent700}>
            Need help now?
          </AppText>
          <AppText variant="meta" style={styles.crisisSubtitle}>
            Crisis lines and immediate support, one tap away.
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({
  value,
  caption,
  tint,
}: {
  value: string;
  caption: string;
  tint: 'accent' | 'accent2' | 'neutral';
}) {
  const dotColor =
    tint === 'accent' ? Mixed.dotAccent : tint === 'accent2' ? Mixed.dotAccent2 : Mixed.dotNeutral;
  const textColor =
    tint === 'accent'
      ? Colors.accent700
      : tint === 'accent2'
        ? Colors.accent2700
        : Colors.neutral800;

  return (
    <Card style={styles.statCard}>
      <DotTexture color={dotColor} />
      <AppText variant="stat" color={textColor}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.statCaption}>
        {caption}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.page,
    paddingBottom: 12,
    gap: Spacing.section,
  },
  dateLine: {
    marginTop: 2,
  },
  sectionLabel: {
    marginBottom: Spacing.gapXs,
  },

  // Mood check-in
  moodCard: {
    backgroundColor: Mixed.moodCardBg,
    gap: Spacing.gap,
    overflow: 'hidden',
  },
  moodCircle: {
    top: -30,
    right: -30,
  },
  moodRow: {
    flexDirection: 'row',
    gap: Spacing.gapXs,
  },
  moodPill: {
    // The design says `flex: 1`, but a CSS flex item also gets `min-width: auto`,
    // which floors it at its content width — so in the browser "Overwhelmed"
    // renders wider than the other two. Yoga has no `min-width: auto`, so a
    // literal `flex: 1` divides the row into three equal columns and clips that
    // label. `flexGrow` alone keeps flexBasis at content width and shares the
    // leftover space, which is what the CSS actually resolves to.
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.neutral100,
    borderWidth: 1,
    borderColor: Colors.neutral300,
  },
  moodPillActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  moodPillLabel: {
    fontFamily: FontFamily.bodySemibold,
    fontSize: FontSize.meta,
  },

  // Hero CTA
  hero: {
    backgroundColor: Colors.accent2700,
    borderRadius: Radii.lg,
    padding: Spacing.cardLoose,
    gap: Spacing.gapSm,
    overflow: 'hidden',
  },
  heroCircleTop: {
    top: -50,
    right: -40,
  },
  heroCircleBottom: {
    bottom: -45,
    left: '20%',
  },
  heroButton: {
    marginTop: 4,
  },

  // Continue your practice
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.rowGap,
  },
  resumeBody: {
    flex: 1,
    minWidth: 0,
  },
  resumeTitle: {
    marginBottom: 6,
  },

  // Stats
  statRow: {
    flexDirection: 'row',
    gap: Spacing.gapXs,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  // No extra margin: the .card gap already separates number from caption on
  // Home. (The You screen's variant does add margin-top: 2px.)
  statCaption: {
    textAlign: 'center',
  },

  // Recommendations
  recScroll: {
    marginHorizontal: -Spacing.page,
  },
  recContent: {
    paddingHorizontal: Spacing.page,
    gap: Spacing.gapSm,
  },
  recCard: {
    width: 150,
    gap: Spacing.gapXs,
  },
  recTitle: {
    lineHeight: FontSize.label * 1.3,
  },
  recDuration: {
    marginTop: 'auto',
  },

  // Crisis banner
  crisisBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap,
    padding: Spacing.banner,
    borderRadius: Radii.lg,
    backgroundColor: Mixed.crisisBannerBg,
    borderWidth: 1,
    borderColor: Mixed.crisisBannerBorder,
  },
  crisisDot: {
    width: 34,
    height: 34,
    borderRadius: Radii.pill,
    backgroundColor: Colors.accent,
  },
  crisisBody: {
    flex: 1,
  },
  crisisTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.label,
  },
  crisisSubtitle: {
    marginTop: 2,
  },
});
