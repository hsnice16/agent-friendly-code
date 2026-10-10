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
    q: "Does the skill contact this website?",
    a: "No. The scoring code is copied into the skill and packed into its dist/ folder with @vercel/ncc. Once installed, every score runs on your own computer, with no network request. If this site goes offline tomorrow, the skill keeps working the same way.",
  },
  {
    q: "Which agents does it score against?",
    a: "Nine: Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, and Pi, the same ones this site scores. It doesn't matter which agent runs the skill: you always get all 9 scores. The same one-line install works in any agent that supports vercel-labs/skills (Cline, Copilot, Continue, Roo Code, Windsurf, Amp, and others).",
  },
  {
    q: "How does it pick a model to suggest?",
    a: "After scoring, the skill puts the overall score in a band (high, mid, or low) and suggests a type of model. A high-scoring repo is set up well enough to get real value from a top model (Opus, GPT-5, Gemini 2.5 Pro). A low-scoring repo can't make use of the extra power, so a smaller, faster model is the better choice. The suggestion doesn't favor any provider, and the rules are in SKILL.md.",
  },
  {
    q: "Where is the source?",
    a: "github.com/hsnice16/agent-friendly-skill. It's MIT-licensed and uses version tags. To choose a version, add '#<version>' to the install command: `npx skills add hsnice16/agent-friendly-skill#v0` always gets the latest 0.x.y, and '#v0.1.0' stays on one exact version. (The CLI uses '#' for versions, because '@' picks a skill by name.) The scoring code is copied from this site's repo (lib/scoring/) and kept in sync by hand, as this site's AGENTS.md describes.",
  },
];

export const SCORE_BANDS: Array<{ band: string; range: string; recommendation: string }> = [
  {
    band: "High",
    range: "≥ 80",
    recommendation:
      "Top model: Opus / GPT-5 / Gemini 2.5 Pro. The repo is well set up, so the model can make full use of it.",
  },
  {
    band: "Mid",
    range: "≥ 60, < 80",
    recommendation: "Standard model: Sonnet / GPT-5 Codex / Gemini 2.5 Flash. A good default; a top model is optional.",
  },
  {
    band: "Low",
    range: "< 60",
    recommendation:
      "Small, fast model: Haiku / GPT-4o-mini / Gemini 2.5 Flash-Lite. The repo isn't set up well enough to get value from a top model.",
  },
];
