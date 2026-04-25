import { type ScoreTier, scoreTier } from "./score";

const TIER_COLOR: Record<ScoreTier, string> = {
  low: "#f85149",
  mid: "#d29922",
  good: "#3fb950",
};

const LABEL_BG = "#24292f";
const MISSING_COLOR = "#8b949e";

const SEG_PAD = 8;
const CHAR_W = 6.5;

function textWidth(s: string): number {
  return Math.round(s.length * CHAR_W);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function badgeSvg(label: string, value: string, score: number | null): string {
  const fill = score == null ? MISSING_COLOR : TIER_COLOR[scoreTier(score)];

  const labelW = textWidth(label) + SEG_PAD * 2;
  const valueW = textWidth(value) + SEG_PAD * 2;

  const labelX = labelW / 2;
  const totalW = labelW + valueW;

  const valueX = labelW + valueW / 2;
  const ariaLabel = `${label}: ${value}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="${escapeXml(
    ariaLabel,
  )}"><title>${escapeXml(
    ariaLabel,
  )}</title><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><rect width="${totalW}" height="20" rx="3" fill="#fff"/><g shape-rendering="crispEdges"><rect width="${labelW}" height="20" fill="${LABEL_BG}"/><rect x="${labelW}" width="${valueW}" height="20" fill="${fill}"/><rect width="${totalW}" height="20" rx="3" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11"><text x="${labelX}" y="14">${escapeXml(
    label,
  )}</text><text x="${valueX}" y="14">${escapeXml(value)}</text></g></svg>`;
}
