export const APP_VERSION = "0.1.0";
export const APP_NAME = "Agent Friendly Code";

export const IS_PRE_RELEASE = APP_VERSION.startsWith("0.0.");
export const REPO_URL = "https://github.com/hsnice16/agent-friendly-code";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://agent-friendly-code.vercel.app";
export const APP_DESCRIPTION =
  "Public dashboard ranking open-source repos by how friendly they are to AI coding agents (Claude Code, Cursor, Devin, GPT-5 Codex) — per model, across GitHub, GitLab, and Bitbucket.";
