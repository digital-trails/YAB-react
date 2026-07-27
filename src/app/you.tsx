import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Card,
  Chevron,
  DecorCircle,
  DotTexture,
  Tag,
  Toggle,
} from '@/components/ui/primitives';
import { AppText } from '@/components/ui/text';
import {
  Colors,
  FontFamily,
  FontSize,
  Mixed,
  Radii,
  Spacing,
  Tracking,
  tracking,
} from '@/constants/tokens';
import {
  DEFAULT_SETTINGS,
  formatPracticeTime,
  sampleContentRepository,
  type AppSettings,
  type Tint,
  type WeeklyActivity,
} from '@/data/content';

/** Badges cycle the palette in order, as in the design. */
const BADGE_TINTS: Tint[] = ['accent', 'accent2', 'neutral'];

export default function YouScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const progress = sampleContentRepository.getProgressSummary();

  const set = <K extends keyof AppSettings>(key: K) => (value: AppSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View>
        <AppText variant="title">Your progress</AppText>
        <AppText variant="subtitle" style={styles.subtitle}>
          Every practice session adds up
        </AppText>
      </View>

      {/* All-time stats */}
      <View style={styles.statRow}>
        <StatCard value={String(progress.dayStreak)} caption="day streak" tint="accent" />
        <StatCard value={String(progress.sessions)} caption="sessions" tint="accent2" />
        <StatCard
          value={formatPracticeTime(progress.minutesPracticed)}
          caption="practiced"
          tint="neutral"
        />
      </View>

      <WeeklyChart days={progress.weeklyActivity} />

      {/* Badges */}
      <View>
        <AppText variant="sectionLabel" style={styles.sectionLabel}>
          Badges
        </AppText>
        <View style={styles.badges}>
          {progress.badges.map((badge, i) => (
            <Tag key={badge} label={badge} tint={BADGE_TINTS[i % BADGE_TINTS.length]} />
          ))}
        </View>
      </View>

      {/* Settings */}
      <View>
        <AppText variant="sectionLabel" style={styles.sectionLabel}>
          Settings
        </AppText>
        <Card style={styles.settingsCard}>
          <SettingRow label="Daily reminder" sub={settings.dailyReminderTime}>
            <Toggle
              label="Daily reminder"
              value={settings.dailyReminder}
              onValueChange={set('dailyReminder')}
            />
          </SettingRow>

          <SettingRow label="Push notifications">
            <Toggle
              label="Push notifications"
              value={settings.pushNotifications}
              onValueChange={set('pushNotifications')}
            />
          </SettingRow>

          {/*
            UI-only. The guardian account-linking and consent flow behind this
            is not designed yet, so flipping it changes nothing but local state.
            TODO: do not ship this toggle until sharing actually works — a teen
            must not believe an adult is or isn't seeing their data incorrectly.
          */}
          <SettingRow label="Share progress with a trusted adult">
            <Toggle
              label="Share progress with a trusted adult"
              value={settings.shareWithTrustedAdult}
              onValueChange={set('shareWithTrustedAdult')}
            />
          </SettingRow>

          <SettingRow label="Privacy & data" dot={Colors.neutral500}>
            <Chevron size={14} />
          </SettingRow>

          {/*
            Crisis entry point — functionally critical, not decorative. Inert by
            decision, pending real region-correct crisis numbers.
            TODO: wire to real crisis resources before any user-facing build. A
            teen tapping this must not hit a dead end.
          */}
          <SettingRow label="Help & crisis resources" dot={Colors.neutral500} last>
            <Chevron size={14} />
          </SettingRow>
        </Card>
      </View>
    </ScrollView>
  );
}

function StatCard({ value, caption, tint }: { value: string; caption: string; tint: Tint }) {
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

/** Seven-day bar chart. Bar heights are percentages of the 80px plot area. */
function WeeklyChart({ days }: { days: WeeklyActivity[] }) {
  return (
    <Card style={styles.chartCard}>
      <DecorCircle size={110} color={Mixed.chartCircle} style={styles.chartCircle} />
      <AppText style={styles.chartLabel}>This week&apos;s activity</AppText>
      <View style={styles.chartPlot}>
        {days.map((day, i) => (
          <View key={`${day.label}-${i}`} style={styles.chartColumn}>
            <View
              style={[
                styles.chartBar,
                {
                  // A floor of 4% keeps a zero day visible as a baseline tick
                  // rather than vanishing, per the design.
                  height: `${Math.max(day.value, 4)}%`,
                  // The design's neutral-300 bars are 1.11:1 against the card —
                  // effectively invisible. neutral-500 lifts that to 2.15:1.
                  // Still short of the 3:1 that WCAG 1.4.11 wants for a
                  // graphic that carries meaning, but going darker collapses
                  // the contrast against today's accent bar (neutral-600 vs
                  // accent is 1.19:1), which would erase the highlight. Fixing
                  // this properly needs a design decision, not a colour swap.
                  backgroundColor: day.isToday ? Colors.accent : Colors.neutral500,
                },
              ]}
            />
            <AppText style={styles.chartDay}>{day.label}</AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

function SettingRow({
  label,
  sub,
  dot = Colors.accent,
  last,
  children,
}: {
  label: string;
  sub?: string;
  dot?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.settingRow, last ? null : styles.settingRowDivider]}>
      <View style={[styles.settingDot, { backgroundColor: dot }]} />
      <View style={styles.settingBody}>
        <AppText variant="rowTitle">{label}</AppText>
        {sub ? <AppText variant="meta">{sub}</AppText> : null}
      </View>
      {children}
    </View>
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
    gap: Spacing.sectionTight,
  },
  subtitle: {
    marginTop: 2,
  },
  sectionLabel: {
    marginBottom: Spacing.gapXs,
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
  statCaption: {
    marginTop: 2,
    textAlign: 'center',
  },

  // Weekly chart
  chartCard: {
    overflow: 'hidden',
  },
  chartCircle: {
    top: -35,
    right: -25,
  },
  chartLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sectionLabel,
    color: Colors.neutral700,
    textTransform: 'uppercase',
    letterSpacing: tracking(FontSize.sectionLabel, Tracking.kicker),
    marginBottom: 14,
  },
  chartPlot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 9,
    height: 80,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    height: '100%',
  },
  chartBar: {
    width: '100%',
    borderRadius: 6,
  },
  chartDay: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.tiny,
    color: Colors.neutral700,
  },

  // Badges
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.gapXs,
  },

  // Settings list
  settingsCard: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap,
    paddingVertical: 14,
    paddingHorizontal: Spacing.banner,
  },
  settingRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral300,
  },
  settingDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
    flexShrink: 0,
  },
  settingBody: {
    flex: 1,
    minWidth: 0,
  },
});
