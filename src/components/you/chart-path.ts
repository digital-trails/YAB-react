// Pure SVG path helpers shared by the mood and correlation line charts.

export type ChartPoint = { x: number; y: number };

/** Centripetal-ish Catmull-Rom spline through the given points, as an SVG path's `d`. */
export function buildSmoothPath(points: ChartPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Index ranges of contiguous non-null runs, so a chart can break its line across gaps. */
export function splitDefinedRuns<T>(values: (T | null)[]): { start: number; end: number }[] {
  const runs: { start: number; end: number }[] = [];
  let runStart: number | null = null;
  values.forEach((value, index) => {
    if (value !== null) {
      if (runStart === null) runStart = index;
    } else if (runStart !== null) {
      runs.push({ start: runStart, end: index - 1 });
      runStart = null;
    }
  });
  if (runStart !== null) runs.push({ start: runStart, end: values.length - 1 });
  return runs;
}
