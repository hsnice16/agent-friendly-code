import { MODELS } from "@/lib/scoring/weights";

export function readers(signalId: string): number {
  return MODELS.filter((m) => (m.weights[signalId] ?? 0) > 0).length;
}
