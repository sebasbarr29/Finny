// Simple, accessible SVG line chart: solid/dashed series, dashed gridlines, month labels.
export type Series = { label: string; values: number[]; color: string; dashed?: boolean; area?: boolean };

type Props = {
  labels: string[];
  series: Series[];
  height?: number;
  ariaLabel: string;
  showYAxis?: boolean;
  formatY?: (n: number) => string;
};

function niceRange(min: number, max: number): [number, number, number] {
  const span = Math.max(max - min, Math.abs(max) * 0.1, 1);
  const rawStep = span / 3;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) ?? rawStep;
  const lo = Math.floor((min - span * 0.08) / step) * step;
  const hi = Math.ceil((max + span * 0.08) / step) * step;
  return [lo, hi, step];
}

export default function LineChart({ labels, series, height = 220, ariaLabel, showYAxis = false, formatY }: Props) {
  const W = 640;
  const padL = showYAxis ? 54 : 10;
  const padR = 12;
  const padT = 12;
  const padB = 30;
  const all = series.flatMap((s) => s.values);
  const [lo, hi, step] = niceRange(Math.min(...all), Math.max(...all));
  const x = (i: number) =>
    padL + (labels.length === 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (labels.length - 1));
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (height - padT - padB);
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(t);
  const fmt = formatY ?? ((n: number) => `$${Math.round(n / 1000)}k`);

  return (
    <svg className="line-chart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={ariaLabel}>
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`lc-fill-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={s.color} stopOpacity="0.16" />
            <stop offset="1" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--line-2)" strokeDasharray="4 6" strokeWidth="1" />
          {showYAxis && (
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" className="lc-tick">{fmt(t)}</text>
          )}
        </g>
      ))}
      {labels.map((l, i) => (
        <text
          key={l + i}
          x={x(i)}
          y={height - 8}
          textAnchor={labels.length === 1 ? "middle" : i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
          className="lc-label"
        >
          {l}
        </text>
      ))}
      {series.map((s, i) => {
        const pts = s.values.map((v, j) => `${x(j)},${y(v)}`);
        const last = s.values.length - 1;
        return (
          <g key={s.label}>
            {s.area && s.values.length > 1 && (
              <path d={`M${pts.join(" L")} L${x(last)},${height - padB} L${x(0)},${height - padB} Z`} fill={`url(#lc-fill-${i})`} />
            )}
            {s.values.length > 1 && (
              <polyline
                points={pts.join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth="2.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={s.dashed ? "8 7" : undefined}
              />
            )}
            <circle cx={x(last)} cy={y(s.values[last])} r="4.5" fill={s.color} />
          </g>
        );
      })}
    </svg>
  );
}
