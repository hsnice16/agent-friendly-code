import { MODELS, type ModelProfile } from "@/lib/scoring/weights";

export function readers(signalId: string): number {
  return MODELS.filter((m) => (m.weights[signalId] ?? 0) > 0).length;
}

// The profiles do not sum to the same number, so raw weights would overstate the heavier profile.
export function weightShare(model: ModelProfile, signalId: string): number {
  const sum = Object.values(model.weights).reduce((s, w) => s + w, 0);
  return sum === 0 ? 0 : (model.weights[signalId] ?? 0) / sum;
}
