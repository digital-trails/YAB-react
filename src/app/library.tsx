import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Card,
  Chevron,
  IconAvatar,
  ProgressBar,
  Segmented,
  Tag,
  tintColors,
} from '@/components/ui/primitives';
import { AppText } from '@/components/ui/text';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/tokens';
import { sampleContentRepository, type Intervention, type SkillModule } from '@/data/content';

type Filter = 'all' | 'moment' | 'skills';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'moment', label: 'In the moment' },
  { key: 'skills', label: 'Skills training' },
];

export default function LibraryScreen() {
  const [filter, setFilter] = useState<Filter>('all');

  const interventions = sampleContentRepository.getInterventions();
  const modules = sampleContentRepository.getSkillModules();

  const showMoment = filter !== 'skills';
  const showSkills = filter !== 'moment';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View>
        <AppText variant="title">Library</AppText>
        <AppText variant="subtitle" style={styles.subtitle}>
          Practices and support, whenever you need them
        </AppText>
      </View>

      <Segmented options={FILTERS} value={filter} onChange={setFilter} />

      {showMoment ? (
        <View>
          <SectionHeading title="In the moment" tagLabel="quick support" tagTint="accent" />
          <View style={styles.rows}>
            {interventions.map((item) => (
              <InterventionRow key={item.id} item={item} />
            ))}
          </View>
        </View>
      ) : null}

      {showSkills ? (
        <View style={styles.skillsSection}>
          <SectionHeading title="Skills training" tagLabel="build over time" tagTint="accent2" />
          <View style={styles.rows}>
            {modules.map((item) => (
              <SkillCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function SectionHeading({
  title,
  tagLabel,
  tagTint,
}: {
  title: string;
  tagLabel: string;
  tagTint: 'accent' | 'accent2';
}) {
  return (
    <View style={styles.sectionHeading}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      <Tag label={tagLabel} tint={tagTint} />
    </View>
  );
}

/**
 * An in-the-moment exercise.
 *
 * TODO: inert — no exercise player exists yet, that flow isn't in this design
 * pass. The chevron is the design's own affordance, so this reads as tappable;
 * wire it up before any user-facing build.
 */
function InterventionRow({ item }: { item: Intervention }) {
  const colors = tintColors(item.tint);
  return (
    <Card style={[styles.row, { backgroundColor: colors.card }]}>
      <IconAvatar letter={item.title[0]} tint={item.tint} />
      <View style={styles.rowBody}>
        <AppText variant="rowTitle">{item.title}</AppText>
        <AppText variant="meta" style={styles.rowMeta}>
          {item.durationMinutes} min · {item.technique}
        </AppText>
      </View>
      <Chevron />
    </Card>
  );
}

/** A skills-training module, with its progress through the series. */
function SkillCard({ item }: { item: SkillModule }) {
  const colors = tintColors(item.tint);
  return (
    <Card style={{ backgroundColor: colors.card }}>
      <View style={styles.skillHeader}>
        <IconAvatar letter={item.title[0]} tint={item.tint} />
        <View style={styles.rowBody}>
          <AppText variant="rowTitle">{item.title}</AppText>
          <AppText variant="meta" style={styles.rowMeta}>
            Module {item.order} of {item.totalInSeries} · {item.durationMinutes} min
          </AppText>
        </View>
      </View>
      <ProgressBar percent={item.progressPercent} />
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
    gap: Spacing.sectionTight,
  },
  subtitle: {
    marginTop: 2,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gapXs,
    marginBottom: Spacing.gapSm,
  },
  sectionTitle: {
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.body,
  },
  rows: {
    gap: Spacing.gapSm,
  },
  skillsSection: {
    paddingBottom: Spacing.gapXs,
  },

  // In-the-moment rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowMeta: {
    marginTop: 2,
  },

  // Skills cards
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap,
    marginBottom: Spacing.gapSm,
  },
});
