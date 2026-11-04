import { type AdoptionPoint, SERIES_LABEL } from "@/lib/agents-md-adoption";
import { dayEpoch, formatDay, formatMonth, percent } from "@/lib/utils/format";

type Series = { label: string; value: (p: AdoptionPoint) => number; line: string; dot: string; area?: string };

// Primary in ink, context in muted: the site has no categorical palette, and
// two lines read apart by lightness alone in both themes. Direct end labels
// and the legend carry identity, so it is never colour alone.
const SERIES: Series[] = [
  {
    label: SERIES_LABEL.agentsMd,
    value: (p) => p.agentsMd,
    line: "stroke-ink",
    dot: "bg-ink",
    area: "fill-ink/[0.03]",
  },
  { label: SERIES_LABEL.claudeMd, value: (p) => p.claudeMd, line: "stroke-muted", dot: "bg-muted" },
];

// viewBox units; the SVG stretches to its box, so strokes opt out of scaling.
const W = 1000;
const H = 300;
const STEP = 0.2;

// Every byte of path data ships twice (HTML and RSC payload); a tenth of a unit is under a pixel.
const round = (n: number) => Math.round(n * 10) / 10;

/** Epoch seconds of each UTC month start after `from`, up to `to`. */
function monthTicks(from: number, to: number): number[] {
  const ticks: number[] = [];
  const d = new Date(from * 1000);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + 1);
  for (; d.getTime() <= to * 1000; d.setUTCMonth(d.getUTCMonth() + 1)) ticks.push(d.getTime() / 1000);
  return ticks;
}

export function AdoptionChart({ points }: { points: AdoptionPoint[] }) {
  const first = points[0];
  const last = points[points.length - 1];
  const t0 = dayEpoch(first.date);
  const span = Math.max(1, dayEpoch(last.date) - t0);
  const share = (s: Series, p: AdoptionPoint) => s.value(p) / p.repos;
  const max = Math.max(...points.flatMap((p) => SERIES.map((s) => share(s, p))));
  // Headroom above the highest line for its end label.
  const yMax = Math.min(1, Math.ceil((max + 0.06) / STEP) * STEP);
  const yTicks = Array.from({ length: Math.round(yMax / STEP) + 1 }, (_, i) => i * STEP);

  const x = (p: AdoptionPoint) => round(((dayEpoch(p.date) - t0) / span) * W);
  const y = (v: number) => round(H - (v / yMax) * H);
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
  const path = (s: Series) => points.map((p, i) => `${i ? "L" : "M"}${x(p)},${y(share(s, p))}`).join("");

  const summary = SERIES.map(
    (s) =>
      `${s.label}: ${percent(s.value(first), first.repos)} on ${formatDay(first.date)}, ${percent(s.value(last), last.repos)} on ${formatDay(last.date)}`,
  ).join("; ");

  return (
    <figure className="m-0">
      <ul className="m-0 mb-4 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-[13px] text-ink-dim">
        {SERIES.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span aria-hidden className={`h-0.5 w-4 rounded-full ${s.dot}`} />
            {s.label}
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2">
        <div aria-hidden className="relative text-[11.5px] tabular-nums text-muted">
          {yTicks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: pct(1 - t / yMax) }}>
              {Math.round(t * 100)}%
            </span>
          ))}
        </div>

        <div className="relative h-[220px] sm:h-[280px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Share of leaderboard repos with each file over time. ${summary}.`}
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            {yTicks.map((t) => (
              <line
                key={t}
                x1={0}
                x2={W}
                y1={y(t)}
                y2={y(t)}
                vectorEffect="non-scaling-stroke"
                className={t === 0 ? "stroke-line-strong" : "stroke-line"}
              />
            ))}
            {SERIES.map(
              (s) => s.area && <path key={`${s.label}-area`} d={`${path(s)}L${W},${H}L0,${H}Z`} className={s.area} />,
            )}
            {SERIES.map((s) => (
              <path
                key={s.label}
                d={path(s)}
                vectorEffect="non-scaling-stroke"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                className={`fill-none ${s.line}`}
              />
            ))}
          </svg>

          {SERIES.map((s) => {
            const top = pct(1 - share(s, last) / yMax);
            return (
              <div key={s.label} aria-hidden>
                <span
                  className={`pointer-events-none absolute right-0 size-2 translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface ${s.dot}`}
                  style={{ top }}
                />
                <span
                  className="pointer-events-none absolute right-0 -translate-y-[calc(100%+8px)] text-[12.5px] font-medium tabular-nums text-ink"
                  style={{ top }}
                >
                  {percent(s.value(last), last.repos)}
                </span>
              </div>
            );
          })}
        </div>

        <div aria-hidden className="relative col-start-2 mt-2 h-4 text-[11.5px] text-muted">
          {monthTicks(t0, t0 + span).map((t, i) => (
            <span
              key={t}
              className={`absolute -translate-x-1/2 ${i % 2 ? "max-sm:hidden" : ""}`}
              style={{ left: pct((t - t0) / span) }}
            >
              {formatMonth(t)}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
