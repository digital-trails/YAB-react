import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Heading } from '@/components/ui';
import { Palette, Radius, Shadow } from '@/constants/tokens';
import {
  getActivityFeed,
  getComparisonVsMood,
  getDomainBreakdown,
  getMoodOverTime,
  getStreakData,
  getTimeOfDayData,
  getUserSummary,
  getWeeklyFrequency,
} from '@/mockUserData';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MOOD_EMOJIS = ['😞', '😕', '😐', '🙂', '😄'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 340;

export default function YouScreen() {
  const user = getUserSummary();
  const streak = getStreakData();
  const activity = getActivityFeed();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Heading style={styles.avatarLetter}>{user.avatarLetter}</Heading>
        </View>

        <Heading style={styles.name}>{user.name}</Heading>

        <Text style={styles.summary}>
          {user.streakDays} day streak · {user.sessions} sessions
        </Text>
      </View>

      <View style={styles.divider} />

      <StreakCard
        currentRun={streak.currentRun}
        weekCompleted={streak.weekCompleted}
        longestChain={streak.longestChain}
      />

      <PatternsCarousel />

      <View style={styles.activitySection}>
        <Heading style={styles.activityTitle}>Your activity</Heading>

        {activity.map((entry, index) => (
          <View key={`${entry.activity}-${index}`} style={styles.entryGroup}>
            <Text style={styles.day}>{entry.day}</Text>

            <View style={styles.entry}>
              <Heading style={styles.entryTitle}>{entry.activity}</Heading>

              <Text style={styles.response}>{entry.response}</Text>

              <Text style={styles.time}>{entry.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Streak card
// ---------------------------------------------------------------------------

function StreakCard({
  currentRun,
  weekCompleted,
  longestChain,
}: {
  currentRun: number;
  weekCompleted: boolean[];
  longestChain: number;
}) {
  return (
    <View style={styles.card}>
      <Heading style={styles.cardTitle}>🔥 {currentRun} Days in a Row</Heading>
      <Text style={styles.cardSubtitle}>Keep it up — you&apos;re on a roll!</Text>

      <View style={styles.weekRow}>
        {WEEK_LABELS.map((label, i) => (
          <View key={i} style={styles.weekDayCol}>
            <View
              style={[
                styles.weekDot,
                weekCompleted[i] ? styles.weekDotDone : styles.weekDotEmpty,
              ]}>
              {weekCompleted[i] ? <Text style={styles.weekCheck}>✓</Text> : null}
            </View>
            <Text style={styles.weekLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.longestChain}>🏆 Longest Chain: {longestChain}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Patterns carousel — 5 swipeable pages with dot pagination
// ---------------------------------------------------------------------------

function PatternsCarousel() {
  const [page, setPage] = useState(0);
  const pages = [
    <MoodOverTimePage key="mood" />,
    <ComparisonVsMoodPage key="cvm" />,
    <TimeOfDayPage key="tod" />,
    <DomainBreakdownPage key="domain" />,
    <WeeklyFrequencyPage key="weekly" />,
  ];

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (index !== page) setPage(index);
  };

  return (
    <View style={styles.patternsSection}>
      <Heading style={styles.patternsTitle}>Your patterns</Heading>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={[styles.carouselScroll, { height: 265 }]}>
        {pages.map((content, i) => (
          <View key={i} style={styles.carouselPage}>
            {content}
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {pages.map((_, i) => (
          <View key={i} style={[styles.pageDot, i === page && styles.pageDotActive]} />
        ))}
      </View>
    </View>
  );
}

function PatternCard({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Heading style={styles.cardTitle}>{title}</Heading>
      <Text style={styles.cardSubtitle}>&quot;{summary}&quot;</Text>
      {children}
    </View>
  );
}

/** Simple polyline chart. Swap for a real chart lib later — the props are
 * already just plain numeric points, so this component's internals are the
 * only thing that would change. */
function MoodOverTimePage() {
  const data = getMoodOverTime();
  const max = 5;
  const chartHeight = 90;

  return (
    <PatternCard title="How You've Been Feeling" summary={data.summary}>
      <View style={styles.lineChartRow}>
        {data.points.map((p, i) => {
          const h = (p.value / max) * chartHeight;
          return (
            <View key={i} style={styles.lineChartCol}>
              <Text style={styles.emojiDot}>{MOOD_EMOJIS[p.value - 1]}</Text>
              <View style={styles.lineChartTrack}>
                <View style={[styles.lineChartFill, { height: h }]} />
              </View>
              <Text style={styles.axisLabel}>{p.label}</Text>
            </View>
          );
        })}
      </View>
    </PatternCard>
  );
}

function ComparisonVsMoodPage() {
  const data = getComparisonVsMood();
  const chartHeight = 90;

  return (
    <PatternCard title="A Pattern We Noticed" summary={data.summary}>
      <View style={styles.dualBarRow}>
        {data.points.map((p, i) => (
          <View key={i} style={styles.lineChartCol}>
            <View style={styles.dualBarTrack}>
              <View
                style={[
                  styles.dualBarComparison,
                  { height: (p.comparison / 100) * chartHeight },
                ]}
              />
              <View
                style={[styles.dualBarMood, { height: (p.mood / 100) * chartHeight }]}
              />
            </View>
            <Text style={styles.axisLabel}>{p.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: Palette.accent }]} />
          <Text style={styles.legendLabel}>Comparison</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: Palette.accent2_700 }]} />
          <Text style={styles.legendLabel}>Mood</Text>
        </View>
      </View>
    </PatternCard>
  );
}

function TimeOfDayPage() {
  const data = getTimeOfDayData();
  const chartHeight = 80;
  const max = Math.max(...data.buckets.map((b) => b.percent));

  return (
    <PatternCard title="When Comparison Shows Up" summary={data.summary}>
      <View style={styles.barRow}>
        {data.buckets.map((b, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={styles.barPercent}>{b.percent}%</Text>
            <View
              style={[
                styles.bar,
                {
                  height: (b.percent / max) * chartHeight,
                  backgroundColor: Palette.accent2,
                },
              ]}
            />
            <Text style={styles.axisLabel}>{b.label}</Text>
          </View>
        ))}
      </View>
    </PatternCard>
  );
}

function DomainBreakdownPage() {
  const data = getDomainBreakdown();

  return (
    <PatternCard title="What Comparison Is About" summary={data.summary}>
      <View style={styles.domainList}>
        {data.items.map((item, i) => (
          <View key={i} style={styles.domainRow}>
            <View style={styles.domainLabelRow}>
              <Text style={styles.domainEmoji}>{item.emoji}</Text>
              <Text style={styles.domainLabel}>{item.label}</Text>
              <Text style={styles.domainPercent}>{item.percent}%</Text>
            </View>
            <View style={styles.domainTrack}>
              <View
                style={[
                  styles.domainFill,
                  { width: `${item.percent}%`, backgroundColor: Palette.accent2 },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </PatternCard>
  );
}

function WeeklyFrequencyPage() {
  const data = getWeeklyFrequency();
  const maxCount = Math.max(...data.days.map((d) => d.count), 1);

  return (
    <PatternCard title="Comparison This Week" summary={data.summary}>
      <View style={styles.freqRow}>
        {data.days.map((d, i) => (
          <View key={i} style={styles.freqCol}>
            <View style={styles.freqDotsCol}>
              {Array.from({ length: maxCount }, (_, dotIndex) => {
                const filled = dotIndex < d.count;
                return (
                  <View
                    key={dotIndex}
                    style={[styles.freqDot, filled ? styles.freqDotFilled : styles.freqDotEmpty]}
                  />
                );
              })}
            </View>
            <Text style={styles.axisLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.freqTotalPill}>
        <Text style={styles.freqTotalText}>{data.totalLabel}</Text>
      </View>
    </PatternCard>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Palette.bg,
  },

  content: {
    padding: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 20,
  },

  header: {
    alignItems: 'center',
    gap: 5,
    paddingTop: 8,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.accent2_200,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLetter: {
    fontSize: 25,
    color: Palette.accent2_700,
  },

  name: {
    fontSize: 23,
    color: Palette.text,
  },

  summary: {
    color: Palette.neutral700,
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: Palette.neutral300,
  },

  card: {
    gap: 12,
    padding: 18,
    backgroundColor: Palette.neutral100,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.neutral300,
    boxShadow: Shadow.elevSm,
  },
  cardTitle: {
    fontSize: 19,
    color: Palette.text,
  },
  cardSubtitle: {
    fontSize: 13.5,
    color: Palette.neutral700,
    lineHeight: 19,
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  weekDayCol: {
    alignItems: 'center',
    gap: 6,
  },
  weekDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotDone: {
    backgroundColor: Palette.accent2_700,
  },
  weekDotEmpty: {
    backgroundColor: Palette.neutral300,
  },
  weekCheck: {
    color: Palette.bg,
    fontSize: 13,
    fontWeight: '700',
  },
  weekLabel: {
    fontSize: 11,
    color: Palette.neutral700,
  },
  longestChain: {
    fontSize: 13,
    color: Palette.neutral700,
    marginTop: 2,
  },

  patternsSection: {
    gap: 12,
  },
  patternsTitle: {
    fontSize: 23,
    color: Palette.text,
  },
  carouselScroll: {
    marginHorizontal: -20,
  },
  carouselPage: {
  width: CARD_WIDTH,
  height: 500,
  paddingHorizontal: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.neutral300,
  },
  pageDotActive: {
    backgroundColor: Palette.accent2_700,
    width: 16,
  },

  lineChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  lineChartCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  emojiDot: {
    fontSize: 14,
  },
  lineChartTrack: {
    width: 6,
    height: 90,
    justifyContent: 'flex-end',
  },
  lineChartFill: {
    width: 6,
    borderRadius: 3,
    backgroundColor: Palette.accent2,
  },
  axisLabel: {
    fontSize: 10.5,
    color: Palette.neutral700,
  },

  dualBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  dualBarTrack: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'flex-end',
    height: 90,
  },
  dualBarComparison: {
    width: 5,
    borderRadius: 2.5,
    backgroundColor: Palette.accent,
  },
  dualBarMood: {
    width: 5,
    borderRadius: 2.5,
    backgroundColor: Palette.accent2_700,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: Palette.neutral700,
  },

  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  barCol: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  barPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.text,
  },
  bar: {
    width: 26,
    borderRadius: 8,
  },

  domainList: {
    gap: 2,
    marginTop: 3,
  },
  domainRow: {
    gap: 3,
  },
  domainLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  domainEmoji: {
    fontSize: 14,
  },
  domainLabel: {
    flex: 1,
    fontSize: 14,
    color: Palette.text,
  },
  domainPercent: {
    fontSize: 13,
    color: Palette.neutral700,
  },
  domainTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.neutral300,
    overflow: 'hidden',
  },
  domainFill: {
    height: 6,
    borderRadius: 3,
  },

  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  freqCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  freqDotsCol: {
    gap: 4,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'flex-end',
  },
  freqDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  freqDotFilled: {
    backgroundColor: Palette.accent,
  },
  freqDotEmpty: {
    backgroundColor: Palette.neutral300,
  },
  freqTotalPill: {
    marginTop: 10,
    padding: 12,
    borderRadius: Radius.sm,
    backgroundColor: Palette.neutral200,
  },
  freqTotalText: {
    fontSize: 13,
    color: Palette.text,
  },

  activitySection: {
    gap: 16,
  },

  activityTitle: {
    fontSize: 23,
    color: Palette.text,
  },

  entryGroup: {
    gap: 7,
  },

  day: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.neutral700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  entry: {
    gap: 7,
    padding: 14,
    backgroundColor: Palette.neutral100,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.neutral300,
    boxShadow: Shadow.elevSm,
  },

  entryTitle: {
    fontSize: 18,
    color: Palette.text,
  },

  response: {
    fontSize: 14,
    lineHeight: 21,
    color: Palette.text,
  },

  time: {
    fontSize: 11,
    color: Palette.neutral700,
  },
});