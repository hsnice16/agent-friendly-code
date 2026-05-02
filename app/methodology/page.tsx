import type { Metadata } from "next";
import Link from "next/link";

import { Panel, PanelHeading } from "@/components/Panel";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";

export const metadata: Metadata = {
  title: "Methodology",
  twitter: { title: "Methodology" },
  alternates: { canonical: "/methodology" },
  openGraph: { title: "Methodology", url: "/methodology" },
  description:
    "How scores are computed today: the signals checked, the per-model weight profiles, the scoring formula, and what the static-heuristic approach deliberately doesn't measure yet.",
};

const FAQ = [
  {
    q: "How is the agent-friendliness score computed?",
    a: "Each repository is shallow-cloned and evaluated against sixteen static signals — twelve cross-agent (AGENTS.md / CLAUDE.md, CI, tests, README, linter, type config, license, contributing guide, reproducible dev environment, pre-commit hooks, dependency manifest, codebase size) plus four agent-specific instruction files (`.cursor/rules/*.mdc`, `GEMINI.md`, `.openhands/setup.sh`, `.aider.conf.yml`). Per-model score = Σ(signal.pass × model.weight[signal]) / Σ(model.weight) × 100. Overall score = mean of per-model scores.",
  },
  {
    q: "Why score per model instead of giving one overall number?",
    a: "Different agents lean on different repository properties — and we know which because each vendor documents it. Claude Code loads CLAUDE.md at the start of every conversation, so AGENTS.md and tests carry the most weight. GPT-5 Codex reads AGENTS.md before doing any work, so AGENTS.md is the strongest single signal for it. Devin runs in a sandboxed VM and needs an explicit dev-env setup (deps, secrets, lint/test commands), so dev-environment beats CI. Cursor cites `.cursor/rules/` and AGENTS.md as its canonical instruction surface. The same repository can score very differently across models, and a single overall number would hide that.",
  },
  {
    q: "Which AI coding agents are evaluated?",
    a: "Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, and Pi. Each has its own weight profile encoded in lib/scoring/weights.ts.",
  },
  {
    q: "Is this a benchmark of agent performance?",
    a: "No. Today every score is derived from static signals — file existence and content-length checks on the cloned tree. No agent is actually run. Per-model rationales are now derived from each agent's published documentation (see the Sources panel below for the URLs), but the weights themselves are still pre-benchmark — they're not yet calibrated against measured agent success. Treat the numbers as a directional signal, not a verdict.",
  },
  {
    q: "How can I improve my repository's score?",
    a: "Add an AGENTS.md or CLAUDE.md file describing the project for agents, configure CI, ensure tests run, write a substantive README, add a linter and type config, include a license and CONTRIBUTING guide, and provide a reproducible dev environment (devcontainer or Dockerfile). The repo detail page lists the highest-impact gaps for each model.",
  },
  {
    q: "How do I keep my score from regressing on PRs?",
    a: "Install the agent-friendly-action GitHub Action (hsnice16/agent-friendly-action). It scores the PR head and base inside your CI and posts a single comment with the score delta and per-signal changes — opt-in via an AGENTS_BADGE_TOKEN secret, falls through silently when the secret is unset. Each repo detail page shows a copy-paste workflow snippet under 'Catch score regressions on every PR'.",
  },
  {
    q: "What is AGENTS.md or CLAUDE.md?",
    a: "A markdown file at the root of a repository that gives an AI coding agent a quick orientation: what the project is, how to build and test it, key conventions, and where to look. It is the highest-weighted signal for Pi, tied with the test suite as the top weight for Claude Code, and meaningfully helps every other agent.",
  },
  {
    q: "How often is the data refreshed?",
    a: "Manually for now — repositories are re-scored when the seed list changes or the rubric is updated. Automated periodic refresh is planned for v0.6.0.",
  },
  {
    q: "Which forges are supported?",
    a: "GitHub, GitLab, and Bitbucket. Cross-forge support is built into the cloning and scoring pipeline so the leaderboard can compare repositories regardless of host.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((entry) => ({
    "@type": "Question",
    name: entry.q,
    acceptedAnswer: { "@type": "Answer", text: entry.a },
  })),
};

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Methodology</h1>

        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          How scores are computed today, what&apos;s being measured, and where the current approach stops short.
        </p>
      </section>

      <Panel className="border-warn/40">
        <PanelHeading>
          <span className="text-warn">Status: documented rationales, pre-benchmark weights</span>
        </PanelHeading>

        <p className="text-[14.5px] leading-relaxed text-ink-dim">
          Today every score is derived from <strong className="text-ink">static signals</strong> — file existence and
          content-length checks on the cloned tree. No agent is actually run. Per-model rationales are{" "}
          <strong className="text-ink">derived from each agent's published documentation</strong> — see the Sources
          links under every model below. The weight values themselves are still pre-benchmark; they aren't yet
          calibrated against measured agent success. The combination is enough to produce meaningfully different
          rankings and to show how the UX of per-model scoring feels, but it should not be read as a benchmark.
        </p>

        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
          The plan to replace pre-benchmark weights with measured ones is part of the v1.0.0 production cut on the{" "}
          <Link href="/roadmap" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
            roadmap
          </Link>{" "}
          (
          <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
            tasks/1.0.0/03-benchmark-harness.md
          </code>
          ). Until then, treat the numbers as a directional signal, not a verdict.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Score formula</PanelHeading>
          <pre className="m-0 overflow-x-auto rounded-lg border border-line bg-surface-2 px-4 py-3.5 font-mono text-[13px] leading-relaxed text-ink-dim">
            {`per-model score = Σ(signal.pass × model.weight[signal]) / Σ(model.weight) × 100
overall         = mean(per-model scores)
improvement     = closing a gap unlocks  (1 - pass) × weight / Σweight × 100  points`}
          </pre>

          <p className="mt-3 text-sm text-muted">
            <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs">signal.pass</code>{" "}
            is a float in [0, 1] — partial credit is allowed (e.g. a thin README gets 0.3, a long one gets 1.0).
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Signals ({SIGNALS.length})</PanelHeading>

          <ul className="m-0 list-none p-0">
            {SIGNALS.map((s) => (
              <li
                key={s.id}
                className="grid grid-cols-[160px_1fr] items-start gap-5 border-b border-line py-3 last:border-b-0"
              >
                <div>
                  <div className="text-[14.5px] font-medium">{s.label}</div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-muted">{s.id}</div>
                </div>

                <div>
                  <div className="text-sm text-ink-dim">{s.description}</div>
                  <div className="mt-1.5 text-[13px] text-muted">
                    <strong className="text-ink-dim">Improve:</strong> {s.improveSuggestion}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Models & weight profiles ({MODELS.length})</PanelHeading>

          <ul className="m-0 list-none p-0">
            {MODELS.map((m) => (
              <li key={m.id} className="border-b border-line py-3 last:border-b-0">
                <div className="text-[15px] font-medium">{m.label}</div>
                <div className="mt-1 text-[13.5px] text-ink-dim">{m.rationale}</div>

                {m.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px] text-muted">
                    <span>Sources:</span>

                    {m.sources.map((url) => {
                      const parsed = new URL(url);
                      const lastSeg = parsed.pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop() ?? "";
                      const host = parsed.hostname.replace(/^www\./, "");
                      const label = lastSeg ? `${host}/${lastSeg}` : host;

                      return (
                        <a
                          key={url}
                          href={url}
                          title={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline"
                        >
                          {label}
                        </a>
                      );
                    })}
                  </div>
                )}

                <details className="mt-2 text-[13px] text-muted">
                  <summary className="cursor-pointer">Weights</summary>

                  <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs leading-relaxed">
                    {Object.entries(m.weights)
                      .map(([k, v]) => `${k.padEnd(16)} ${v.toFixed(2)}`)
                      .join("\n")}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What isn&apos;t measured yet</PanelHeading>
          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            <li>Whether tests actually pass (we only detect their presence).</li>
            <li>Whether the linter actually runs cleanly.</li>

            <li>Whether the dev-env artifact (Makefile, Dockerfile) works end-to-end.</li>

            <li>
              Commit-history signals — churn, commit frequency, contributor count. We use
              <code className="mx-1 rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-xs">
                --depth 1 --single-branch
              </code>
              which fetches the whole working tree at HEAD of the default branch, but no history. Closing this gap is
              planned as v0.5.0 on the{" "}
              <Link href="/roadmap" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
                roadmap
              </Link>
              .
            </li>

            <li>How agents actually perform on the repo — that&apos;s the v1.0.0 benchmark harness.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
