/**
 * Dependency-free SVG chart primitives.
 * Every colour comes from design tokens via `stroke-*` / `fill-*` utilities.
 */

export function Sparkline({
  values,
  className = "text-primary",
  height = 36,
  area = true,
}: {
  values: number[];
  className?: string;
  height?: number;
  area?: boolean;
}) {
  if (values.length < 2) return null;
  const w = 100;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = 30 - ((v - min) / span) * 26 - 2;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const last = pts[pts.length - 1]!;
  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      style={{ height }}
      className={`w-full ${className}`}
      aria-hidden
    >
      {area ? (
        <path d={`${line} L100,32 L0,32 Z`} fill="currentColor" opacity={0.12} />
      ) : null}
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r={2} fill="currentColor" />
    </svg>
  );
}

export function Donut({
  segments,
  size = 132,
  centerLabel,
  centerSub,
}: {
  segments: { label: string; value: number; className: string }[];
  size?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" className="text-border" stroke="currentColor" strokeWidth={13} opacity={0.5} />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="currentColor"
              className={s.className}
              strokeWidth={13}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {centerLabel ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="num text-lg font-semibold">{centerLabel}</span>
          {centerSub ? (
            <span className="text-[10px] text-muted-foreground">{centerSub}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function BarRow({
  label,
  value,
  max,
  display,
  className = "bg-primary",
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  className?: string;
}) {
  const pct = Math.max(2, Math.round((value / (max || 1)) * 100));
  return (
    <div className="grid grid-cols-[minmax(90px,1fr)_2.5fr_auto] items-center gap-3 text-xs">
      <span className="truncate text-surface-foreground">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-surface">
        <span className={`block h-full rounded-full ${className}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="num tabular-nums text-muted-foreground">{display}</span>
    </div>
  );
}

export function ColumnChart({
  data,
  height = 160,
  format,
}: {
  data: { label: string; a: number; b?: number }[];
  height?: number;
  format?: (v: number) => string;
}) {
  const max = Math.max(...data.flatMap((d) => [d.a, d.b ?? 0])) || 1;
  return (
    <div className="flex items-end gap-2" style={{ height: height + 22 }}>
      {data.map((d) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-end justify-center gap-1" style={{ height }}>
            <div
              className="w-1/2 rounded-t-md bg-primary/85 transition-all duration-300 group-hover:bg-primary"
              style={{ height: `${Math.max(3, Math.round((d.a / max) * height))}px` }}
              title={format ? format(d.a) : String(d.a)}
            />
            {d.b !== undefined ? (
              <div
                className="w-1/2 rounded-t-md bg-warning/80 transition-all duration-300 group-hover:bg-warning"
                style={{ height: `${Math.max(3, Math.round((d.b / max) * height))}px` }}
                title={format ? format(d.b) : String(d.b)}
              />
            ) : null}
          </div>
          <span className="num text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function StackedBar({
  parts,
}: {
  parts: { label: string; value: number; className: string }[];
}) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full">
        {parts.map((p) => (
          <span
            key={p.label}
            className={p.className}
            style={{ width: `${(p.value / total) * 100}%` }}
            title={`${p.label}: ${p.value}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-1.5 text-muted-foreground">
            <span className={`h-2 w-2 rounded-sm ${p.className}`} />
            {p.label}
            <span className="num text-foreground">{p.value.toLocaleString("en-IN")}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
