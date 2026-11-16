import type { ModelId } from "./scoring/weights";

export type ComparePair = { slug: string; a: ModelId; b: ModelId };

// Slugs and their order follow how people search each pair ("gemini cli vs
// claude code", not the reverse), so they are written out, not derived.
export const COMPARE_PAIRS: ComparePair[] = [
  { slug: "claude-code-vs-cursor", a: "claude-code", b: "cursor" },
  { slug: "claude-code-vs-codex", a: "claude-code", b: "gpt-5-codex" },
  { slug: "gemini-cli-vs-claude-code", a: "gemini-cli", b: "claude-code" },
  { slug: "cursor-vs-codex", a: "cursor", b: "gpt-5-codex" },
  { slug: "aider-vs-claude-code", a: "aider", b: "claude-code" },
  { slug: "openhands-vs-claude-code", a: "openhands", b: "claude-code" },
  { slug: "pi-vs-claude-code", a: "pi", b: "claude-code" },
  { slug: "kimi-cli-vs-claude-code", a: "kimi-cli", b: "claude-code" },
  { slug: "devin-vs-claude-code", a: "devin", b: "claude-code" },
  { slug: "codex-vs-gemini-cli", a: "gpt-5-codex", b: "gemini-cli" },
];

export function pairBySlug(slug: string): ComparePair | null {
  return COMPARE_PAIRS.find((p) => p.slug === slug) ?? null;
}

/** The pairs an agent is in, for linking from its own pages. */
export function pairsWith(id: ModelId): ComparePair[] {
  return COMPARE_PAIRS.filter((p) => p.a === id || p.b === id);
}
