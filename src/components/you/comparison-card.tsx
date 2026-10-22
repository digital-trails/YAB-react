import { buildComparisonPoints } from '@/data/you-patterns';
import type { ModuleCompletion } from '@/data/module-history';

import { PatternCard } from './card';
import { CorrelationChart } from './correlation-chart';

export function ComparisonCard({ activity }: { activity: ModuleCompletion[] }) {
  const points = buildComparisonPoints(activity);
  const hasData = points.some((point) => point.comparison || point.mood);

  return (
    <PatternCard title="A Pattern We Noticed" summary={hasData ? 'Comparison and mood from your check-ins.' : 'Complete Tune In check-ins to compare these patterns.'}>
      <CorrelationChart points={points} />
    </PatternCard>
  );
}
