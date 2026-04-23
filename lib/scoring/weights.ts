export type ModelId = "claude-code" | "cursor" | "devin" | "gpt-5-codex";

export type ModelProfile = {
  id: ModelId;
  label: string;
  rationale: string;
  weights: Record<string, number>;
};

export const MODELS: ModelProfile[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    rationale:
      "Weights AGENTS.md and tests heavily — Claude Code leans on an instructions file and a fast feedback loop.",
    weights: {
      ci: 0.5,
      size: 0.5,
      tests: 1.0,
      readme: 0.7,
      linter: 0.6,
      dev_env: 0.9,
      license: 0.3,
      agents_md: 1.0,
      pre_commit: 0.4,
      type_config: 0.6,
      contributing: 0.4,
      deps_manifest: 0.7,
    },
  },
  {
    id: "cursor",
    label: "Cursor",
    rationale:
      "Weights type config and a detailed README highly — Cursor's inline edits benefit from static types and skim-readable docs.",
    weights: {
      agents_md: 0.6,
      readme: 1.0,
      tests: 0.7,
      ci: 0.4,
      linter: 0.8,
      deps_manifest: 0.8,
      dev_env: 0.5,
      type_config: 1.0,
      license: 0.3,
      contributing: 0.3,
      pre_commit: 0.3,
      size: 0.4,
    },
  },
  {
    id: "devin",
    label: "Devin",
    rationale:
      "Weights CI and reproducible envs highly — Devin runs in a sandboxed VM and needs end-to-end automation.",
    weights: {
      agents_md: 0.6,
      readme: 0.7,
      tests: 0.9,
      ci: 1.0,
      linter: 0.5,
      deps_manifest: 0.9,
      dev_env: 1.0,
      type_config: 0.5,
      license: 0.3,
      contributing: 0.5,
      pre_commit: 0.5,
      size: 0.6,
    },
  },
  {
    id: "gpt-5-codex",
    label: "GPT-5 Codex",
    rationale: "Balanced profile as a reference point.",
    weights: {
      ci: 0.7,
      size: 0.5,
      tests: 0.8,
      linter: 0.6,
      readme: 0.8,
      dev_env: 0.7,
      license: 0.3,
      agents_md: 0.7,
      pre_commit: 0.4,
      type_config: 0.7,
      contributing: 0.4,
      deps_manifest: 0.7,
    },
  },
];

export const MODEL_BY_ID: Record<ModelId, ModelProfile> = Object.fromEntries(MODELS.map((m) => [m.id, m])) as Record<
  ModelId,
  ModelProfile
>;
