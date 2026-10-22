import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Heading } from '@/components/ui';
import { Palette, Radius, themedStyleSheet } from '@/constants/tokens';
import { buildMoodPoints, type DateRange, type Range } from '@/data/you-patterns';
import type { ModuleCompletion } from '@/data/module-history';

import { ComparisonCard } from './comparison-card';
import { DomainCard } from './domain-card';
import { FrequencyCard } from './frequency-card';
import { MoodCard } from './mood-card';
import { TimeCard } from './time-card';

export function PatternsCarousel({
  range,
  window,
  customRange,
  onRangeChange,
  onCustomRangeChange,
  activity,
}: {
  range: Range;
  window: DateRange;
  customRange: DateRange | null;
  onRangeChange: (range: Range) => void;
  onCustomRangeChange: (range: DateRange | null) => void;
  activity: ModuleCompletion[];
}) {
  const { dates, points } = useMemo(() => buildMoodPoints(window, activity), [activity, window]);
  const { width: screenWidth } = useWindowDimensions();
  const [page, setPage] = useState(0);
  // The carousel is full-bleed (negative margins), so its own width — not the
  // padded parent's — is the paging interval.
  const [pageWidth, setPageWidth] = useState(screenWidth);
  const [pageHeights, setPageHeights] = useState<Record<number, number>>({});
  const carouselRef = useRef<ScrollView>(null);
  const pageHeight = pageHeights[page];
  // Pattern cards read metadata rather than a module id, so any check-in that
  // recorded the fields shows up here.
  const checkIns = activity.filter((entry) => entry.metadata != null);
  const cards = [
    <MoodCard key="mood" dates={dates} points={points} range={range} onRangeChange={onRangeChange} customRange={customRange} onCustomRangeChange={onCustomRangeChange} />,
    <ComparisonCard key="comparison" activity={checkIns} />,
    <TimeCard key="time" activity={checkIns} />,
    <DomainCard key="domain" activity={checkIns} />,
    <FrequencyCard key="frequency" activity={checkIns} />,
  ];
  const tabs = [
    { label: 'Mood', icon: 'happy-outline' as const, color: Palette.accent2_700 },
    { label: 'Pattern', icon: 'git-compare-outline' as const, color: Palette.accent700 },
    { label: 'Time', icon: 'time-outline' as const, color: Palette.accent2_700 },
    { label: 'Topics', icon: 'sparkles-outline' as const, color: Palette.accent700 },
    { label: 'Frequency', icon: 'stats-chart-outline' as const, color: Palette.accent2_700 },
  ];
  const goToPage = (nextPage: number) => {
    const boundedPage = Math.max(0, Math.min(cards.length - 1, nextPage));
    setPage(boundedPage);
    carouselRef.current?.scrollTo({ x: boundedPage * pageWidth, animated: false });
  };

  return (
    <View style={styles.section}>
      <Heading style={styles.title}>Your patterns</Heading>
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
        onScroll={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / pageWidth))}
        style={[styles.carousel, pageHeight ? { height: pageHeight } : null]}
        contentContainerStyle={styles.carouselContent}>
        {cards.map((card, index) => (
          <View
            key={index}
            onLayout={(event) => {
              const height = event.nativeEvent.layout.height;
              setPageHeights((current) => (current[index] === height ? current : { ...current, [index]: height }));
            }}
            style={[styles.carouselPage, { width: pageWidth }]}>
            {card}
          </View>
        ))}
      </ScrollView>
      <View style={styles.tabs}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: page === index }}
            accessibilityLabel={`${tab.label} pattern`}
            onPress={() => goToPage(index)}
            style={[styles.tab, page === index && styles.tabActive]}>
            <View style={[styles.tabImage, { backgroundColor: page === index ? tab.color : Palette.neutral200, borderWidth: page === index ? 2 : 0, borderColor: page === index ? Palette.bg : 'transparent' }]}>
              <Ionicons name={tab.icon} size={22} color={page === index ? Palette.bg : tab.color} />
            </View>
            <Text style={[styles.tabLabel, page === index && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = themedStyleSheet(() => ({
  section: { gap: 10 },
  title: { fontSize: 23, color: Palette.text },
  carousel: { marginHorizontal: -20 },
  carouselContent: { alignItems: 'flex-start' },
  carouselPage: { paddingHorizontal: 20 },
  tabs: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 3, paddingTop: 0, paddingBottom: 2 },
  tab: { flex: 1, minWidth: 0, alignItems: 'center', gap: 3, paddingVertical: 5, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'transparent' },
  tabActive: { backgroundColor: Palette.accent2_100, borderColor: Palette.accent2_700 },
  tabImage: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { color: Palette.neutral700, fontSize: 9, fontWeight: '700' },
  tabLabelActive: { color: Palette.text },
}));
