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
    a: "No. The scorer is bundled in, so it runs on your computer with no network request, even if this site goes offline.",
  },
  {
    q: "Which agents does it score against?",
    a: `The same ${MODELS.length} this site scores: ${agentList()}. You get all ${MODELS.length} whichever agent runs it, and it installs in any agent that supports vercel-labs/skills (Cline, Copilot, Continue, Roo Code, Windsurf, Amp, and others).`,
  },
  {
    q: "Can it tell me which agent to use for my codebase?",
    a: "It tells you which agent your repo is best set up for and what to add for the others. It doesn't test how well each agent writes code: it is a readiness check, not a ranking of agents.",
  },
  {
    q: "How does it pick a model to suggest?",
    a: "From the overall score's band (high, mid or low). A well set up repo gets real value from a frontier model; a poorly set up one doesn't, so a small, fast model does as well. The rules are in SKILL.md and favor no provider.",
  },
  {
    q: "How do I pin a version?",
    a: "Add '#<tag>' to the install command: '#v0' follows the latest 0.x release, '#v0.1.0' stays on that version. It's '#', not '@', because '@' picks a skill by name.",
  },
];

// Family names, not versions: the band is about model class, and a version
// number here goes stale with every release.
export const SCORE_BANDS: Array<{ band: string; range: string; recommendation: string }> = [
  {
    band: "High",
    range: "≥ 80",
    recommendation: "Frontier: Opus / GPT-5 / Gemini Pro. The repo is set up well enough to use it fully.",
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
      "Small: Haiku / GPT-5 nano / Gemini Flash-Lite. The repo isn't set up to get value from a frontier model.",
  },
];
