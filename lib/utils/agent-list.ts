import { MODELS } from "@/lib/scoring/weights";

/** "Claude Code, Cursor, …, and Pi" — prose built from MODELS so a new agent cannot be left out of it. */
export function agentList(labels: string[] = MODELS.map((m) => m.label)): string {
  if (labels.length <= 2) {
    return labels.join(" and ");
  }
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}
