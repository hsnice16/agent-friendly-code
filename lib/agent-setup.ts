import type { ModelId } from "./scoring/weights";

/**
 * Where each agent looks for its instructions and how to tell what loaded. The
 * troubleshooting guide's tables and the /model setup panel both render from
 * here, so they can't disagree. Strings may hold `[label](url)` links, each to
 * the page that states the fact; where that page is silent the text says so.
 */
export type AgentSetup = {
  /** Files it reads, where, and which wins. */
  reads: string;
  /** Whether AGENTS.md needs a setting or flag before it loads. */
  needs: string;
  limit: string;
  confirm: string;
  /** What to do after editing the file mid-session. */
  reload: string;
  /** The smallest setup that works, for the /model page. */
  setup: string[];
  /** Signal ids whose /check pages cover this agent's files. */
  checks: string[];
  sources: string[];
};

const CLAUDE = "https://code.claude.com/docs/en/memory";
const CODEX = "https://learn.chatgpt.com/docs/agent-configuration/agents-md";
const CURSOR = "https://cursor.com/docs/rules";
const CURSOR_HELP = "https://cursor.com/help/customization/rules";
const CURSOR_CLI = "https://cursor.com/docs/cli/using";
const DEVIN = "https://docs.devin.ai/onboard-devin/agents-md";
const DEVIN_KNOWLEDGE = "https://docs.devin.ai/onboard-devin/knowledge-onboarding";
const DEVIN_CLI = "https://docs.devin.ai/cli/extensibility/rules";
const DEVIN_BLUEPRINT = "https://docs.devin.ai/onboard-devin/environment/git-backed-blueprints";
const KIMI = "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/agents.md";
const KIMI_COMMANDS = "https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/reference/slash-commands.md";
const GEMINI = "https://geminicli.com/docs/cli/gemini-md/";
const ANTIGRAVITY_CLI = "https://antigravity.google/docs/cli/gcli-migration";
const AIDER = "https://aider.chat/docs/usage/conventions.html";
const AIDER_CONF = "https://aider.chat/docs/config/aider_conf.html";
const AIDER_TEST = "https://aider.chat/docs/usage/lint-test.html";
const OPENHANDS = "https://docs.openhands.dev/overview/skills";
const OPENHANDS_SETUP = "https://docs.openhands.dev/openhands/usage/customization/repository";
const PI = "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/configuration.md";
// Pi's docs don't give the per-directory order or the off switch; its loader and CLI do.
const PI_LOADER = "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/resource-loader.ts";
const PI_ARGS = "https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/cli/args.ts";

const NOT_DOCUMENTED = "Not documented.";

export const AGENT_SETUP: Record<ModelId, AgentSetup> = {
  "claude-code": {
    reads: `CLAUDE.md, \`.claude/CLAUDE.md\` and CLAUDE.local.md in the working directory and every directory above it. AGENTS.md and \`.claude/AGENTS.md\` the same way (v2.1.277 and later), but only when none of those CLAUDE.md files exist. \`~/.claude/CLAUDE.md\` doesn't count. A subdirectory's file loads once Claude reads a file there ([docs](${CLAUDE}#agents-md)).`,
    needs: `No setting by default. A CLAUDE.md or CLAUDE.local.md on the path hides AGENTS.md unless it imports \`@AGENTS.md\` or Project instructions in \`/config\` is \`claude-md-and-agents-md\` ([docs](${CLAUDE}#choose-which-instruction-files-load)).`,
    limit: `Skips a file over 4 MiB. Files that load on demand (subdirectory CLAUDE.md, path-scoped rules) are cut at 40,000 characters on a 200K context window. Guidance: under 200 lines per file ([docs](${CLAUDE}#claude-ignores-the-end-of-my-subdirectory-claude-md)).`,
    confirm: `\`/memory\` lists an AGENTS.md it read (v2.1.280 and later); \`/context all\` lists launch files under Memory files. An interactive session prints \`no CLAUDE.md found; AGENTS.md loaded: …\` ([docs](${CLAUDE}#when-claude-code-reads-agents-md)).`,
    reload: `Root CLAUDE.md is re-read after \`/compact\`. After upgrading from v2.1.276 or earlier, AGENTS.md may load only from the next session ([docs](${CLAUDE}#when-agents-md-support-is-unavailable)).`,
    setup: [
      "Keep the shared rules in AGENTS.md.",
      "Add a CLAUDE.md that imports `@AGENTS.md` and holds anything only for Claude, or no CLAUDE.md at all.",
      "A CLAUDE.local.md hides AGENTS.md too: skip it, or set Project instructions to `claude-md-and-agents-md`.",
      "Run `/memory` and check AGENTS.md is listed.",
    ],
    // Claude Code's skills live in `.claude/skills/`, not the `.agents/skills/` the skills check looks for.
    checks: ["agents_md"],
    sources: [CLAUDE],
  },
  "gpt-5-codex": {
    reads: `\`~/.codex/AGENTS.override.md\` or \`AGENTS.md\`, then one file per directory from the project root (usually the Git root) down to the working directory: AGENTS.override.md, else AGENTS.md, else a name in \`project_doc_fallback_filenames\`. Joined root first, so closer files win; nothing below the working directory is read ([docs](${CODEX})).`,
    needs: `No. CLAUDE.md is read only if you list it in \`project_doc_fallback_filenames\` in \`~/.codex/config.toml\` ([docs](${CODEX})).`,
    limit: `32 KiB across every file on the path (\`project_doc_max_bytes\`); Codex stops adding files at the cap. Empty files are skipped ([docs](${CODEX})).`,
    confirm: `\`codex --ask-for-approval never "Summarize the current instructions."\`, or write a log with \`-c log_dir=./.codex-log\` ([docs](${CODEX})).`,
    reload: `Builds the instruction chain once per run. Restart Codex in the target directory; there's no cache to clear ([docs](${CODEX})).`,
    setup: [
      "Put commands and conventions in a root AGENTS.md.",
      "Give each package its own AGENTS.md, and start Codex inside the package you're working on.",
      "Keep the files on any one path under 32 KiB, or raise `project_doc_max_bytes`.",
      "If guidance looks wrong, look for an AGENTS.override.md higher up or in `~/.codex`.",
    ],
    checks: ["agents_md", "agent_skills"],
    sources: [CODEX],
  },
  cursor: {
    reads: `AGENTS.md at the project root and in subdirectories, combined, the more specific winning ([docs](${CURSOR})). CLAUDE.md the same way, always applied ([help](${CURSOR_HELP})). Rules are \`.mdc\` files in \`.cursor/rules/\`. The CLI reads a root AGENTS.md and CLAUDE.md ([CLI docs](${CURSOR_CLI})).`,
    needs: `Not for AGENTS.md. A plain \`.md\` in \`.cursor/rules/\` is ignored; an Apply Intelligently rule needs a \`description\`, and Apply to Specific Files needs \`globs\` that match ([docs](${CURSOR})).`,
    limit: `None documented. Guidance: keep each rule under 500 lines ([docs](${CURSOR})).`,
    confirm: `Customize lists every rule and its status; the docs describe no per-chat view of what applied. Rules apply to Agent (Chat), not Tab or Bugbot ([help](${CURSOR_HELP})).`,
    reload: NOT_DOCUMENTED,
    setup: [
      "Add a root AGENTS.md; Cursor picks it up with no setting.",
      "Put rules that apply only to some files in `.cursor/rules/*.mdc`, with `globs` or a `description`.",
      "Move a legacy `.cursorrules` into a rule: Cursor says it will be deprecated.",
      "Open Customize and check each rule's status.",
    ],
    checks: ["cursor_rules", "agents_md", "agent_skills"],
    sources: [CURSOR, CURSOR_HELP, CURSOR_CLI],
  },
  devin: {
    reads: `Looks for AGENTS.md before it starts coding, in the project root "or anywhere else" ([docs](${DEVIN})); which of several wins isn't documented. Pulls CLAUDE.md, \`.cursorrules\`, \`.mdc\`, \`.rules\` and \`.windsurf\` files into its Knowledge, which is deprecated and moving to Skills in Plugins ([docs](${DEVIN_KNOWLEDGE})). Devin CLI loads root files at session start and subdirectory files when it reaches them ([CLI docs](${DEVIN_CLI})).`,
    needs: `No, but Devin must have access to the repo. Knowledge that isn't pinned is used only when its trigger matches ([docs](${DEVIN_KNOWLEDGE})).`,
    limit: `The first 16 KiB (16,384 bytes) of each AGENTS.md; the rest only if Devin opens the file ([docs](${DEVIN})).`,
    confirm: `Knowledge it used is listed under Accessed Knowledge in the session chat ([docs](${DEVIN_KNOWLEDGE})). The docs don't say how to confirm it read AGENTS.md.`,
    reload: NOT_DOCUMENTED,
    setup: [
      "Add a root AGENTS.md with the critical instructions in its first 16 KiB.",
      "Give Devin access to the repo.",
      "Commit a `.devin/blueprint.yaml` for its environment, or manage one in the settings UI.",
    ],
    checks: ["agents_md", "dev_env", "agent_skills"],
    sources: [DEVIN, DEVIN_KNOWLEDGE, DEVIN_CLI, DEVIN_BLUEPRINT],
  },
  "kimi-cli": {
    reads: `A project AGENTS.md or \`.kimi-code/AGENTS.md\`, plus the global \`~/.kimi-code/AGENTS.md\` (it moves with \`KIMI_CODE_HOME\`) and \`~/.agents/AGENTS.md\`. Injected into the prompt as reference data ([docs](${KIMI})). Subdirectories, precedence and CLAUDE.md aren't documented.`,
    needs: `No ([docs](${KIMI})).`,
    limit: NOT_DOCUMENTED,
    confirm: `Not documented. \`/init\` writes an AGENTS.md from the codebase ([commands](${KIMI_COMMANDS})).`,
    reload: `\`/reload\` reloads the session and tells the agent about external AGENTS.md changes ([commands](${KIMI_COMMANDS})).`,
    setup: ["Add a root AGENTS.md, or run `/init` to draft one.", "After editing it mid-session, run `/reload`."],
    checks: ["agents_md", "agent_skills"],
    sources: [KIMI, KIMI_COMMANDS],
  },
  "gemini-cli": {
    reads: `\`~/.gemini/GEMINI.md\`, then GEMINI.md in the workspace directories and their parents. When a tool touches a file, that directory and its ancestors up to a trusted root ([docs](${GEMINI})). For unpaid and Google One users, Antigravity CLI replaced it on June 18, 2026 ([docs](${GEMINI})); that reads GEMINI.md and AGENTS.md in the active directory ([migration](${ANTIGRAVITY_CLI})).`,
    needs: `Yes. AGENTS.md loads only when named in the \`context.fileName\` setting; the docs' example is \`["AGENTS.md", "CONTEXT.md", "GEMINI.md"]\` ([docs](${GEMINI})).`,
    limit: `None on the GEMINI.md page ([docs](${GEMINI})).`,
    confirm: `The footer shows how many context files loaded; \`/memory show\` prints their combined text ([docs](${GEMINI})).`,
    reload: `\`/memory reload\` re-scans every context file ([docs](${GEMINI})).`,
    setup: [
      'Add `"context": { "fileName": ["AGENTS.md", "GEMINI.md"] }` to settings, or keep a GEMINI.md that imports `@AGENTS.md`.',
      "Check the footer's context-file count, or run `/memory show`.",
    ],
    checks: ["gemini_md", "agents_md", "agent_skills"],
    sources: [GEMINI, ANTIGRAVITY_CLI],
  },
  aider: {
    reads: `Nothing on its own. A file loads when passed with \`--read\`, with \`/read\` in chat, or listed under \`read:\` in \`.aider.conf.yml\` ([docs](${AIDER})). The docs don't mention AGENTS.md by name.`,
    needs: `Yes: \`read: AGENTS.md\`, or a list. \`.aider.conf.yml\` is read from the home directory, the Git root and the current directory, and the file loaded last takes priority; \`--config <file>\` loads only that one ([docs](${AIDER_CONF})).`,
    limit: NOT_DOCUMENTED,
    confirm: `The docs' example session shows \`Added CONVENTIONS.md to the chat.\` at startup ([docs](${AIDER})).`,
    reload: `\`/read AGENTS.md\` adds it to the running chat ([docs](${AIDER})).`,
    setup: [
      "Commit a `.aider.conf.yml` with `read: AGENTS.md`.",
      "Set `test-cmd` and `auto-test` there too, so Aider runs your tests after edits.",
      "Check the startup lines for the file being added.",
    ],
    checks: ["aider_conf", "agents_md"],
    sources: [AIDER, AIDER_CONF, AIDER_TEST],
  },
  openhands: {
    reads: `A root AGENTS.md, in full, in the initial system prompt; CLAUDE.md and GEMINI.md count as model-specific repository context ([docs](${OPENHANDS})). Nested files and precedence aren't documented. Runs \`.openhands/setup.sh\` each time it begins work on the repo ([docs](${OPENHANDS_SETUP})).`,
    needs: `No ([docs](${OPENHANDS})).`,
    limit: `None documented; the docs say to keep AGENTS.md short and move long material into skills ([docs](${OPENHANDS})).`,
    confirm: NOT_DOCUMENTED,
    reload: NOT_DOCUMENTED,
    setup: [
      "Add a short root AGENTS.md.",
      "Add `.openhands/setup.sh` with the install and setup commands, non-interactive.",
      "Move long, occasional procedures into skills.",
    ],
    checks: ["agents_md", "openhands_setup", "agent_skills"],
    sources: [OPENHANDS, OPENHANDS_SETUP],
  },
  pi: {
    reads: `The agent directory (\`~/.pi/agent\`), the working directory and each directory above it ([docs](${PI})). In each, the first of AGENTS.override.md, AGENTS.md, AGENTS.MD, CLAUDE.md and CLAUDE.MD, so an empty AGENTS.md still hides a CLAUDE.md beside it ([loader](${PI_LOADER})). Nothing below the working directory.`,
    needs: `No, and no project trust ([docs](${PI})). \`--no-context-files\` (\`-nc\`) turns them off ([CLI](${PI_ARGS})).`,
    limit: NOT_DOCUMENTED,
    confirm: NOT_DOCUMENTED,
    reload: `\`/reload\` after changing instructions ([docs](${PI})).`,
    setup: [
      "Add a root AGENTS.md; Pi reads it from any directory below.",
      "Don't leave an empty AGENTS.md next to a CLAUDE.md you rely on.",
      "Run `/reload` after editing it mid-session.",
    ],
    checks: ["agents_md", "agent_skills"],
    sources: [PI, PI_LOADER, PI_ARGS],
  },
};

/** Every page cited above, once, in MODELS-independent insertion order. */
export const AGENT_SETUP_SOURCES: string[] = [...new Set(Object.values(AGENT_SETUP).flatMap((a) => a.sources))];
