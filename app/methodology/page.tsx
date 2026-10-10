import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ExternalLink } from "@/components/ExternalLink";
import { Panel, PanelHeading } from "@/components/Panel";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const DESCRIPTION =
  "How we score repos: the checks we run, how much each AI agent cares about each check, the formula, and what we don't measure yet.";

export const metadata: Metadata = {
  title: "Methodology",
  description: DESCRIPTION,
  alternates: { canonical: "/methodology" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: "Methodology", description: DESCRIPTION },
  openGraph: {
    ...OG_DEFAULTS,
    images: [DEFAULT_OG_IMAGE],
    title: "Methodology",
    description: DESCRIPTION,
    url: "/methodology",
    type: "article",
  },
};

const FAQ = [
  {
    q: "How is the score worked out?",
    a: "We download a copy of each repo (latest version only, no history) and run sixteen checks on it. Twelve matter to every agent: AGENTS.md / CLAUDE.md, CI, tests, README, linter, type config, license, contributing guide, a reproducible dev setup, pre-commit hooks, a dependency list, and codebase size. Four are files only one agent reads: `.cursor/rules/*.mdc`, `GEMINI.md`, `.openhands/setup.sh`, and `.aider.conf.yml`. File names can be any case, so `readme.md` and `README.MD` count the same as `README.md`. Score for one agent = Σ(signal.pass × model.weight[signal]) / Σ(model.weight) × 100. The overall score is the average of the agent scores.",
  },
  {
    q: "Why give each agent its own score?",
    a: "Each agent relies on different things in a repo, and each one's docs say which. Claude Code reads CLAUDE.md at the start of every chat, so AGENTS.md and tests count the most. GPT-5 Codex reads AGENTS.md before it does any work, so that file counts most for it. Devin works inside its own sandboxed machine and needs clear setup steps (dependencies, secrets, lint and test commands), so a dev setup counts more than CI. Cursor's docs name `.cursor/rules/` and AGENTS.md as the files it reads for instructions. One repo can score very differently for different agents. A single number would hide that.",
  },
  {
    q: "Which AI coding agents do you score for?",
    a: "Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, and Pi. Each has its own set of weights, in lib/scoring/weights.ts.",
  },
  {
    q: "Does this test how well agents actually work?",
    a: "No. Every score comes from simple file checks: does a file exist, and how long is it. No agent is actually run. The reasons behind each agent's weights come from that agent's own docs (see the Sources links below). But the weight numbers are not yet tested against how agents really perform. Use the scores as a rough guide, not a final verdict.",
  },
  {
    q: "How can I raise my repo's score?",
    a: "Add an AGENTS.md or CLAUDE.md file that explains the project to agents. Set up CI, make sure tests run, and write a detailed README. Add a linter and type config, a license, and a CONTRIBUTING guide. Add a reproducible dev setup (for example a devcontainer, Dockerfile, or Makefile). Each repo's page lists the fixes that help each agent most.",
  },
  {
    q: "How do I stop pull requests from lowering my score?",
    a: "Install the agent-friendly-action GitHub Action (hsnice16/agent-friendly-action). It scores the pull request and the branch it targets, inside your own CI, and posts one comment showing how the score changed and which checks changed. Turn it on by adding an AGENTS_BADGE_TOKEN secret. Without the secret, it does nothing. Each repo's page has a ready-to-copy workflow under 'Check the score on every pull request'.",
  },
  {
    q: "What is AGENTS.md or CLAUDE.md?",
    a: "A markdown file at the top of a repo that gives an AI coding agent a quick tour: what the project is, how to build and test it, the main rules to follow, and where to look. It is the check that counts most for Pi and Kimi CLI. For Claude Code it ties with tests as the top check. It helps every other agent too.",
  },
  {
    q: "How often are scores updated?",
    a: "Every six hours. A scheduled GitHub Actions job scores every repo on our list again and saves the new results, and the site updates on its own. We also score repos again whenever the list or the scoring rules change.",
  },
  {
    q: "Which code hosts are supported?",
    a: "GitHub, GitLab, and Bitbucket. All three go through the same download and scoring steps, so the leaderboard can compare repos no matter where they live.",
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
      <BreadcrumbJsonLd current={{ name: "Methodology", path: "/methodology" }} />
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
          How we work out each score, what we check, and what we can&apos;t check yet.
        </p>
      </section>

      <Panel tone="warn">
        <PanelHeading tone="warn">Where things stand: reasons from docs, weights not yet tested</PanelHeading>

        <p className="text-[14.5px] leading-relaxed text-ink-dim">
          Every score comes from <strong className="text-ink">simple file checks</strong>: does a file exist, and how
          long is it. No agent is actually run. The reasons behind each agent&apos;s weights{" "}
          <strong className="text-ink">come from that agent&apos;s own docs</strong>. See the Sources links under each
          agent below. The weight numbers are not yet tested against how agents really perform. That is enough to rank
          repos in clearly different ways for each agent, but it is not a test of agent performance.
        </p>

        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
          Replacing these weights with measured ones is planned for v1.0.0 on the{" "}
          <Link href="/roadmap" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
            roadmap
          </Link>{" "}
          (
          <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-muted">
            tasks/1.0.0/03-benchmark-harness.md
          </code>
          ). Until then, use the scores as a rough guide, not a final verdict.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Score formula</PanelHeading>
          <pre className="m-0 overflow-x-auto rounded-lg border border-line bg-surface-2 px-4 py-3.5 font-mono text-[13px] leading-relaxed text-ink-dim">
            {`per-agent score = Σ(signal.pass × agent.weight[signal]) / Σ(agent.weight) × 100
overall         = mean(per-agent scores)
improvement     = closing a gap unlocks  (1 - pass) × weight / Σweight × 100  points`}
          </pre>

          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-dim">
            <code className="font-mono text-[12.5px] text-ink">signal.pass</code> is a number from{" "}
            <code className="font-mono text-[12.5px] text-ink">0</code> to{" "}
            <code className="font-mono text-[12.5px] text-ink">1</code>, so a check can pass in part. For example, a
            short README gets <code className="font-mono text-[12.5px] text-ink">0.3</code> and a long one gets{" "}
            <code className="font-mono text-[12.5px] text-ink">1.0</code>.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Checks ({SIGNALS.length})</PanelHeading>

          <p className="mt-2 mb-1 text-[13.5px] leading-relaxed text-ink-dim">
            File names can be any case: <code className="font-mono text-[12.5px] text-ink">readme.md</code> and{" "}
            <code className="font-mono text-[12.5px] text-ink">README.MD</code> both count as a README.
          </p>

          <ul className="m-0 list-none p-0">
            {SIGNALS.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0 sm:grid sm:grid-cols-[160px_1fr] sm:items-start sm:gap-5"
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
          <PanelHeading>AI agents and their weights ({MODELS.length})</PanelHeading>

          <ul className="m-0 list-none p-0">
            {MODELS.map((m) => (
              <li key={m.id} id={`model-${m.id}`} className="scroll-mt-20 border-b border-line py-3 last:border-b-0">
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
                        <ExternalLink key={url} href={url} title={url}>
                          {label}
                        </ExternalLink>
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
          <PanelHeading>What we don&apos;t check yet</PanelHeading>
          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            <li>Whether tests actually pass. We only check that they exist.</li>
            <li>Whether the linter runs without errors.</li>

            <li>Whether the dev setup (Makefile, Dockerfile) really works from start to finish.</li>

            <li>
              Anything from commit history: how often code changes, how often people commit, how many people contribute.
              We use
              <code className="mx-1 rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-xs">
                --depth 1 --single-branch
              </code>
              which downloads every file in the latest version of the main branch, but no history. These say more about
              a repo&apos;s health than about how agents work with it, so we leave them out for now.
            </li>

            <li>How well agents actually do on the repo. That comes with the v1.0.0 benchmark.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
