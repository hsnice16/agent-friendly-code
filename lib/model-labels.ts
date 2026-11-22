// Each agent's label, for client views: MODELS carries every agent's weights and
// sources, and labels passed as props repeated in each repo page's RSC payload.
// tests/model-labels.test.ts keeps it equal to MODELS.
export const MODEL_LABEL: Record<string, string> = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  devin: "Devin",
  "gpt-5-codex": "Codex",
  "kimi-cli": "Kimi Code CLI",
  "gemini-cli": "Gemini CLI",
  aider: "Aider",
  openhands: "OpenHands",
  pi: "Pi",
};
