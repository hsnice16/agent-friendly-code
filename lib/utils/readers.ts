import { MODELS } from "@/lib/scoring/weights";

/** How many agents give the check any weight. */
export function readers(signalId: string): number {
  return MODELS.filter((m) => (m.weights[signalId] ?? 0) > 0).length;
}
