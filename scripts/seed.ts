// Idempotent: re-running updates scores in place.

import { spawnSync } from "node:child_process";

type Seed = { url: string; note?: string };

const SEEDS: Seed[] = [
  // --- GitHub, JavaScript / TypeScript ---
  { url: "https://github.com/vercel/next.js", note: "Next.js framework" },
  { url: "https://github.com/tailwindlabs/tailwindcss", note: "Tailwind CSS" },
  { url: "https://github.com/honojs/hono", note: "Hono web framework" },
  { url: "https://github.com/sindresorhus/ky", note: "Tiny HTTP client" },
  { url: "https://github.com/withastro/astro", note: "Astro framework" },
  {
    note: "Classic Node web framework",
    url: "https://github.com/expressjs/express",
  },
  { url: "https://github.com/prettier/prettier", note: "Code formatter" },

  // --- GitHub, other languages ---
  { url: "https://github.com/astral-sh/ruff", note: "Python linter (Rust)" },
  {
    note: "Rust learning exercises",
    url: "https://github.com/rust-lang/rustlings",
  },
  { url: "https://github.com/denoland/deno", note: "Deno runtime (Rust)" },
  { url: "https://github.com/oven-sh/bun", note: "Bun runtime (Zig)" },
  { url: "https://github.com/pallets/flask", note: "Python web framework" },
  { url: "https://github.com/django/django", note: "Django (Python)" },
  { url: "https://github.com/antiwork/gumroad", note: "Gumroad (Ruby on Rails)" },

  // --- AI-native: coding agents ---
  {
    note: "Open coding agent (formerly OpenDevin)",
    url: "https://github.com/All-Hands-AI/OpenHands",
  },
  {
    note: "OpenCode — CLI coding agent",
    url: "https://github.com/sst/opencode",
  },
  {
    url: "https://github.com/anthropics/claude-code",
    note: "Claude Code (meta — what scores us in turn)",
  },
  {
    note: "OpenAI Codex CLI coding agent",
    url: "https://github.com/openai/codex",
  },
  {
    note: "This project — meta self-ranking",
    url: "https://github.com/hsnice16/agent-friendly-code",
  },
  {
    url: "https://github.com/farzaa/clicky",
    note: "Clicky — coding-agent side project",
  },
  {
    url: "https://github.com/openclaw/openclaw",
    note: "OpenClaw — Captain Claw engine reimplementation (C++)",
  },
  {
    url: "https://github.com/championswimmer/TwoFac",
    note: "TwoFac — 2FA TOTP manager",
  },

  // --- AI-native: models + infra ---
  {
    note: "Transformers library",
    url: "https://github.com/huggingface/transformers",
  },
  { url: "https://github.com/ggml-org/llama.cpp", note: "Local LLM inference" },
  {
    note: "High-throughput LLM serving",
    url: "https://github.com/vllm-project/vllm",
  },
  { url: "https://github.com/BerriAI/litellm", note: "Unified LLM proxy" },

  // --- GitLab ---
  { url: "https://gitlab.com/gitlab-org/cli", note: "GitLab's own CLI (Go)" },
  {
    note: "GitLab Runner (Go)",
    url: "https://gitlab.com/gitlab-org/gitlab-runner",
  },

  // --- Bitbucket ---
  {
    note: "Historic Bitbucket OSS (Java)",
    url: "https://bitbucket.org/snakeyaml/snakeyaml",
  },
];

let ok = 0,
  failed = 0;

for (const s of SEEDS) {
  console.log(`\n━━━ seeding ${s.url}${s.note ? ` — ${s.note}` : ""} ━━━`);

  const r = spawnSync("bun", ["run", "score", s.url], {
    stdio: "inherit",
  });

  if (r.status === 0) {
    ok++;
  } else {
    failed++;
    console.error(`  (failed with status ${r.status}, continuing)`);
  }
}

console.log(`\nseed done — ${ok} ok / ${failed} failed. Run \`bun run dev\` and open http://localhost:3000`);
