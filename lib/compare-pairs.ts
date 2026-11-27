import type { ModelId } from "./scoring/weights";

export type ComparePair = { a: ModelId; b: ModelId };

// The pairs and their order follow how people search them ("gemini cli vs
// claude code", not the reverse), so they are written out, not derived.
export const COMPARE_PAIRS: ComparePair[] = [
  { a: "claude-code", b: "cursor" },
  { a: "claude-code", b: "gpt-5-codex" },
  { a: "gemini-cli", b: "claude-code" },
  { a: "cursor", b: "gpt-5-codex" },
  { a: "aider", b: "claude-code" },
  { a: "openhands", b: "claude-code" },
  { a: "pi", b: "claude-code" },
  { a: "kimi-cli", b: "claude-code" },
  { a: "devin", b: "claude-code" },
  { a: "gpt-5-codex", b: "gemini-cli" },
];

/** Where the pair averages live; every retired /compare URL redirects here. */
export const COMPARE_ANCHOR = "/agents#compare";
