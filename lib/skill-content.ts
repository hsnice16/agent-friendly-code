import { MODELS } from "./scoring/weights";
import { agentList } from "./utils/agent-list";

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

// Codex groups handlers under a matcher, like Claude Code; a bare `command` at
// the event level is ignored.
export const CODEX_HOOK_SNIPPET = `{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "node .agents/skills/agent-friendly/dist/index.js . --summary"
          }
        ]
      }
    ]
  }
}`;

export const SKILL_FAQ = [
  {
    q: "Does the skill contact this website?",
    a: "No. The scoring code is bundled into the skill, so every score runs on your computer with no network request, and keeps working if this site goes offline.",
  },
  {
    q: "Which agents does it score against?",
    a: `The same ${MODELS.length} this site scores: ${agentList()}. You get all ${MODELS.length} scores whichever agent runs the skill, and it installs in any agent that supports vercel-labs/skills (Cline, Copilot, Continue, Roo Code, Windsurf, Amp, and others).`,
  },
  {
    q: "Can it tell me which agent to use for my codebase?",
    a: "It tells you which agent your repo is best set up for and what to add for the others. It does not test how well each agent writes code, so read it as a readiness check, not a ranking of agents.",
  },
  {
    q: "How does it pick a model to suggest?",
    a: "It puts the overall score in a band (high, mid, or low). A well set up repo gets real value from a frontier model; a poorly set up one doesn't, so a small, fast model is the better choice. The rules are in SKILL.md and favor no provider.",
  },
  {
    q: "How do I pin a version?",
    a: "Add '#<tag>' to the install command: '#v0' follows the latest 0.x release, '#v0.1.0' stays on one exact version. The CLI uses '#' for versions because '@' picks a skill by name.",
  },
];

// Family names, not versions: the band is about model class, and a version
// number here goes stale with every release.
export const SCORE_BANDS: Array<{ band: string; range: string; recommendation: string }> = [
  {
    band: "High",
    range: "≥ 80",
    recommendation:
      "Frontier: Opus / GPT-5 / Gemini Pro. The repo is well set up, so the model can make full use of it.",
  },
  {
    band: "Mid",
    range: "≥ 60, < 80",
    recommendation: "Standard: Sonnet / GPT-5 mini / Gemini Flash. A good default; frontier is optional.",
  },
  {
    band: "Low",
    range: "< 60",
    recommendation:
      "Small: Haiku / GPT-5 nano / Gemini Flash-Lite. The repo isn't set up well enough to get value from a frontier model.",
  },
];
