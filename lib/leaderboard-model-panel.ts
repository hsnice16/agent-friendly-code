import type { PassCounts } from "./check-stats";
import { SIGNAL_BY_ID, SIGNALS } from "./scoring/signals";
import { MODELS, type ModelProfile } from "./scoring/weights";

export const MODEL_PANEL_CHECKS = 4;

type ModelPanelCheck = { id: string; label: string; weight: number; counts: PassCounts };

type ModelPanelFile = {
  /** A signal id, or "claude_md" for CLAUDE.md, which shares the AGENTS.md check. */
  id: string;
  label: string;
  /** Repos with the file and content in it, whether or not it passes in full. */
  present: number;
  total: number;
};

export type ModelPanel = { checks: ModelPanelCheck[]; sources: string[]; file: ModelPanelFile | null };

/** Highest weight first; a tie keeps SIGNALS order, so the list never depends on object key order. */
export function topWeightedChecks(model: ModelProfile, limit = MODEL_PANEL_CHECKS): { id: string; weight: number }[] {
  return SIGNALS.map((s) => ({ id: s.id, weight: model.weights[s.id] ?? 0 }))
    .filter((c) => c.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

/** The agent's own file: weighted in full by it, at most half that by any other (Devin reads Cursor rules too). */
export function exclusiveSignal(model: ModelProfile): string | null {
  return (
    SIGNALS.find(
      (s) =>
        (model.weights[s.id] ?? 0) >= 1 &&
        MODELS.every((m) => m.id === model.id || (m.weights[s.id] ?? 0) <= (model.weights[s.id] ?? 0) / 2),
    )?.id ?? null
  );
}

type Inputs = {
  countsOf: (signalId: string) => PassCounts;
  /** Repos whose agent instructions file is CLAUDE.md. */
  claudeMd: number;
};

export function buildModelPanel(model: ModelProfile, { countsOf, claudeMd }: Inputs): ModelPanel {
  const checks = topWeightedChecks(model).map((c) => ({
    ...c,
    label: SIGNAL_BY_ID[c.id].label,
    counts: countsOf(c.id),
  }));
  const total = countsOf(SIGNALS[0].id).total;

  // Claude Code has no check of its own: CLAUDE.md is one of the names the shared AGENTS.md check accepts.
  const own = exclusiveSignal(model);
  let file: ModelPanelFile | null = null;
  if (own) {
    const c = countsOf(own);
    file = { id: own, label: SIGNAL_BY_ID[own].label, present: c.present, total: c.total };
  } else if (model.id === "claude-code") {
    file = { id: "claude_md", label: "CLAUDE.md", present: claudeMd, total };
  }

  return { checks, sources: model.sources, file };
}

/** "host/last-path-segment", the short form /methodology shows for a docs link. */
export function sourceLabel(url: string): string {
  const parsed = new URL(url);
  const lastSeg = parsed.pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop() ?? "";
  const host = parsed.hostname.replace(/^www\./, "");
  return lastSeg ? `${host}/${lastSeg}` : host;
}

/**
 * Checks by their weight summed across every agent: the fixes that move the most
 * agent scores at once. Sums are rounded before sorting so float noise cannot
 * break a tie, which then keeps SIGNALS order.
 */
export function checksBySummedWeight(limit = SIGNALS.length): { id: string; sum: number }[] {
  return SIGNALS.map((s) => ({
    id: s.id,
    sum: Math.round(MODELS.reduce((n, m) => n + (m.weights[s.id] ?? 0), 0) * 100) / 100,
  }))
    .sort((a, b) => b.sum - a.sum)
    .slice(0, limit);
}
