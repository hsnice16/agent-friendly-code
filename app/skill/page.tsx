import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { CopySnippet } from "@/components/CopySnippet";
import { Panel, PanelHeading } from "@/components/Panel";
import { CLAUDE_HOOK_SNIPPET, CODEX_HOOK_SNIPPET, SCORE_BANDS, SKILL_FAQ } from "@/lib/skill-content";
import { ACTION_REPO_URL, APP_KEYWORDS, APP_NAME, APP_URL, SKILL_INSTALL_CMD, SKILL_REPO_URL } from "@/lib/version";

const PAGE_TITLE = "Agent Friendly Skill — score your repo locally and pick the right model";
const PAGE_DESCRIPTION =
  "Portable agent skill that scores the current repo's agent-friendliness on disk and recommends a model. Profiles 8 agents (Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, Pi); installs into any vercel-labs/skills-compatible agent. Self-contained: vendored scorer, no service dependency, works offline.";

const PAGE_KEYWORDS = [...APP_KEYWORDS, "model recommendation", "agent-friendliness score"];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  keywords: PAGE_KEYWORDS,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/skill" },
  twitter: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: "/skill", type: "article" },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SKILL_FAQ.map((entry) => ({
    "@type": "Question",
    name: entry.q,
    acceptedAnswer: { "@type": "Answer", text: entry.a },
  })),
};

const APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${APP_URL}/` },
        { "@type": "ListItem", position: 2, name: "Skill", item: `${APP_URL}/skill` },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${APP_URL}/skill#app`,
      url: SKILL_REPO_URL,
      isAccessibleForFree: true,
      name: "Agent Friendly Skill",
      description: PAGE_DESCRIPTION,
      publisher: { "@id": `${APP_URL}/#org` },
      operatingSystem: "macOS, Linux, Windows",
      applicationCategory: "DeveloperApplication",
      license: "https://opensource.org/licenses/MIT",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      softwareRequirements: "Node.js 20+, an AI coding agent supporting the vercel-labs/skills convention",
    },
  ],
};

export default function SkillPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(APPLICATION_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">
          Agent Friendly Skill — score the repo, pick the model
        </h1>

        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          A portable agent skill that scores your current repo&apos;s agent-friendliness locally and recommends which
          model to use for it. Vendored scorer, no service dependency — works offline, keeps working if {APP_NAME} goes
          down.
        </p>
      </section>

      <Panel tone="warn">
        <PanelHeading tone="warn">Install</PanelHeading>
        <p className="m-0 mb-3 text-[14.5px] leading-relaxed text-ink-dim">
          One command, any supported agent — the{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/vercel-labs/skills"
            className="inline-flex items-center gap-0.5 border-b border-dotted border-ink-dim/60 text-ink hover:border-ink-soft hover:text-ink-soft"
          >
            vercel-labs/skills <ArrowUpRight size={11} weight="bold" aria-hidden="true" />
          </a>{" "}
          CLI autodetects which agents you have configured locally and writes{" "}
          <code className="text-ink-dim">SKILL.md</code> plus the bundled scorer to each one&apos;s skill directory.
        </p>
        <CopySnippet text={SKILL_INSTALL_CMD} highlight="warn" />

        <p className="mt-3 text-[12.5px] text-muted">
          After install, run <code className="text-ink-dim">/agent-friendly</code> (or however your agent invokes
          skills) inside any local repo — the skill resolves the repo root, runs the bundled scorer, and prints the
          score plus a model recommendation. The scorer profiles 8 agents (Claude Code, Cursor, Devin, GPT-5 Codex,
          Gemini CLI, Aider, OpenHands, Pi) and always returns scores for all 8 — the best-fit pick is score-driven, not
          driven by which agent invoked the skill, so the output is identical whether Claude Code, Cline, Copilot,
          Continue, or anything else vercel-labs/skills installs into is calling it.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How it works</PanelHeading>

          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              The agent tells you upfront that it scores the current working directory — so make sure you&apos;re at
              your project root before invoking. The CLI also emits a warning when the path has no project markers (
              <code className="text-ink-dim">package.json</code> / <code className="text-ink-dim">README.md</code> /{" "}
              <code className="text-ink-dim">AGENTS.md</code> / <code className="text-ink-dim">.git</code>) so a wrong
              path can&apos;t silently produce a low score.
            </li>
            <li>
              The agent runs <code className="text-ink-dim">node &lt;skill-dir&gt;/dist/index.js .</code> — a single
              ncc-bundled file with no runtime deps and no network.
            </li>
            <li>
              The scorer evaluates the same sixteen signals this dashboard uses (AGENTS.md, CI, tests, README, linter,
              dev env, license, contributing, pre-commit, deps manifest, type config, codebase size, plus four
              agent-specific instruction files) and returns per-agent scores.
            </li>
            <li>
              The agent picks the highest-scoring entry as the best-fit (score-driven, regardless of which agent is
              invoking the skill), and recommends a model class using the table below — leaving the actual model switch
              up to the user.
            </li>
          </ol>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Score → model mapping</PanelHeading>

          <p className="m-0 mb-3 text-[13px] text-muted">
            Provider-neutral. The skill recommends a model <em>class</em> — the user picks the actual ID for their agent
            and runs <code className="text-ink-dim">/model</code> (or equivalent) themselves.
          </p>

          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full border-separate border-spacing-0 text-[13.5px]">
              <thead>
                <tr className="bg-surface-2 [&>th]:border-b [&>th]:border-line [&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-muted">
                  <th scope="col">Band</th>
                  <th scope="col">Score</th>
                  <th scope="col">Recommendation</th>
                </tr>
              </thead>

              <tbody>
                {SCORE_BANDS.map((b) => (
                  <tr
                    key={b.band}
                    className="[&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-2.5 last:[&>td]:border-b-0"
                  >
                    <td className="font-medium text-ink">{b.band}</td>
                    <td className="tabular-nums text-ink-dim">{b.range}</td>
                    <td className="text-ink-dim">{b.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel tone="info">
          <PanelHeading tone="info">Optional — score every session via SessionStart hook</PanelHeading>
          <p className="m-0 mb-3 text-[14.5px] leading-relaxed text-ink-dim">
            For agents that support session-start hooks, you can have the skill print a one-line summary at the top of
            every session. Drop one of these into the matching settings file:
          </p>

          <p className="m-0 mb-1.5 text-[12.5px] font-medium text-muted">
            Claude Code · <code className="text-ink-dim">.claude/settings.json</code>
          </p>
          <CopySnippet text={CLAUDE_HOOK_SNIPPET} highlight="info" />

          <p className="mt-3 mb-1.5 text-[12.5px] font-medium text-muted">
            Codex CLI · <code className="text-ink-dim">.codex/hooks.json</code>
          </p>
          <CopySnippet text={CODEX_HOOK_SNIPPET} highlight="info" />

          <p className="mt-3 text-[12.5px] text-muted">
            Cursor, Cline, and Copilot don&apos;t expose a session-start hook today — paste the same{" "}
            <code className="text-ink-dim">node ... --summary</code> command into{" "}
            <code className="text-ink-dim">.cursorrules</code> / <code className="text-ink-dim">.clinerules</code> as a
            static instruction, or invoke <code className="text-ink-dim">/agent-friendly</code> manually when you want a
            fresh score.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Self-contained by design</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The scorer and weights are bundled into <code className="text-ink-dim">dist/index.js</code> via{" "}
            <code className="text-ink-dim">@vercel/ncc</code> and committed to the skill repo. Every run is a local
            file-system pass — no network, no dashboard call, no token. If {APP_NAME} disappears, the skill keeps
            scoring. The vendored scoring code is mirrored from {APP_NAME}&apos;s{" "}
            <code className="text-ink-dim">lib/scoring/</code> (this dashboard&apos;s source) and stays in sync via the
            mirror discipline documented in AGENTS.md.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>FAQ</PanelHeading>

          <ul className="m-0 list-none p-0">
            {SKILL_FAQ.map((entry) => (
              <li key={entry.q} className="border-b border-line py-3 last:border-b-0">
                <div className="text-[14.5px] font-medium text-ink">{entry.q}</div>
                <p className="m-0 mt-1 text-[13.5px] leading-relaxed text-ink-dim">{entry.a}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Source</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            <a
              target="_blank"
              href={SKILL_REPO_URL}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              {SKILL_REPO_URL.replace(/^https:\/\//, "")} <ArrowUpRight size={12} weight="bold" aria-hidden="true" />
            </a>{" "}
            — MIT-licensed, semver-tagged. Sibling repo to{" "}
            <a
              target="_blank"
              href={ACTION_REPO_URL}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              agent-friendly-action <ArrowUpRight size={11} weight="bold" aria-hidden="true" />
            </a>{" "}
            — both vendor the same scorer.
          </p>
        </Panel>
      </div>
    </>
  );
}
