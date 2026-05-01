export const CLAUDE_HOOK_SNIPPET = `{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/skills/agent-friendly/dist/index.js . --summary"
          }
        ]
      }
    ]
  }
}`;

export const CODEX_HOOK_SNIPPET = `{
  "hooks": {
    "SessionStart": [
      {
        "command": "node .agents/skills/agent-friendly/dist/index.js . --summary"
      }
    ]
  }
}`;

export const SKILL_FAQ = [
  {
    q: "Does the skill talk to the dashboard?",
    a: "No. The scorer is vendored and bundled into the skill's dist/ via @vercel/ncc. After install, every score runs locally on your repo — no HTTP request. If this dashboard goes offline tomorrow, the skill keeps working unchanged.",
  },
  {
    q: "Which agents does it score against?",
    a: "Eight: Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, Pi — the same set this dashboard profiles. Scoring is the same regardless of which agent invokes the skill; you always get all 8 per-agent scores. The skill installs into any vercel-labs/skills-compatible agent (Cline, Copilot, Continue, Roo Code, Windsurf, Amp, etc.) via the same one-line install.",
  },
  {
    q: "How does the model recommendation work?",
    a: "After scoring, the skill maps the overall score to a band (high / mid / low) and suggests a model class. High-scoring repos are agent-prepped enough to leverage a frontier model (Opus / GPT-5 / Gemini 2.5 Pro). Low-scoring repos can't take advantage of the extra reasoning, so a smaller / faster model is the better trade-off. The mapping is provider-neutral and lives in SKILL.md.",
  },
  {
    q: "Where is the source?",
    a: "github.com/hsnice16/agent-friendly-skill. MIT-licensed, semver-tagged. Pin a ref using the vercel-labs/skills CLI's '#<ref>' fragment syntax — `npx skills add hsnice16/agent-friendly-skill#v0` floats on the latest 0.x.y; '#v0.1.0' pins precisely. (The CLI uses '#' for refs and reserves '@' for skill-name filters.) The scoring code is vendored from the agent-friendly-code dashboard repo's lib/scoring/ and stays in sync per AGENTS.md's mirror discipline.",
  },
];

export const SCORE_BANDS: Array<{ band: string; range: string; recommendation: string }> = [
  {
    band: "High",
    range: "≥ 80",
    recommendation: "Frontier — Opus / GPT-5 / Gemini 2.5 Pro. The repo is well-prepped, the model can leverage it.",
  },
  {
    band: "Mid",
    range: "60 – 79",
    recommendation: "Standard — Sonnet / GPT-5 Codex / Gemini 2.5 Flash. Solid baseline; frontier is optional.",
  },
  {
    band: "Low",
    range: "< 60",
    recommendation:
      "Small / fast — Haiku / GPT-4o-mini / Gemini 2.5 Flash-Lite. Repo lacks the scaffolding to justify a frontier run.",
  },
];
