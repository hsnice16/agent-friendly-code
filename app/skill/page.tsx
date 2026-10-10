import type { Metadata } from "next";

import { CopySnippet } from "@/components/CopySnippet";
import { ExternalLink } from "@/components/ExternalLink";
import { Panel, PanelHeading } from "@/components/Panel";
import { CLAUDE_HOOK_SNIPPET, CODEX_HOOK_SNIPPET, SCORE_BANDS, SKILL_FAQ } from "@/lib/skill-content";
import {
  ACTION_REPO_URL,
  APP_KEYWORDS,
  APP_NAME,
  APP_URL,
  DEFAULT_OG_IMAGE,
  OG_DEFAULTS,
  SKILL_INSTALL_CMD,
  SKILL_REPO_URL,
  TWITTER_DEFAULTS,
} from "@/lib/version";

const PAGE_TITLE = "Agent Skill: score the repo you're in";
const PAGE_DESCRIPTION =
  "An agent skill that scores the repo you're in for nine coding agents, shows which one it is best set up for, and suggests a model class. Runs locally.";

const PAGE_KEYWORDS = [...APP_KEYWORDS, "model recommendation", "agent-friendliness score"];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  keywords: PAGE_KEYWORDS,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/skill" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  openGraph: {
    ...OG_DEFAULTS,
    images: [DEFAULT_OG_IMAGE],
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/skill",
    type: "article",
  },
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
          Agent Friendly Skill: score the repo you&apos;re in
        </h1>

        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          An agent skill that scores the repo you&apos;re working in, on your own computer. It shows which of nine
          agents the repo is best set up for and suggests a model class. The scoring code is built in, so it works
          offline.
        </p>
      </section>

      <Panel tone="warn">
        <PanelHeading tone="warn">Install</PanelHeading>
        <p className="m-0 mb-3 text-[14.5px] leading-relaxed text-ink-dim">
          One command works for any supported agent. The{" "}
          <ExternalLink href="https://github.com/vercel-labs/skills" tone="ink">
            vercel-labs/skills
          </ExternalLink>{" "}
          CLI finds the agents you have set up and adds <code className="text-ink-dim">SKILL.md</code> and the scoring
          code to each one&apos;s skills folder.
        </p>

        <CopySnippet text={SKILL_INSTALL_CMD} highlight="warn" />

        <p className="mt-3 text-[12.5px] text-muted">
          After installing, run <code className="text-ink-dim">/agent-friendly</code> (or however your agent runs
          skills) from the top folder of any repo on your computer. The skill scores the folder you are in and prints
          the score with a suggested model. It always gives scores for all 9 agents (Claude Code, Cursor, Devin, GPT-5
          Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, Pi). The best fit is picked by score, not by which agent ran
          the skill, so you get the same result from Claude Code, Cline, Copilot, Continue, or any other supported
          agent.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How it works</PanelHeading>

          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              The agent tells you first that it scores the folder you&apos;re in, so start from your project&apos;s top
              folder. The CLI also warns you if the folder has no project file such as{" "}
              <code className="text-ink-dim">package.json</code>, <code className="text-ink-dim">pyproject.toml</code>,{" "}
              <code className="text-ink-dim">Cargo.toml</code>, <code className="text-ink-dim">go.mod</code>, a README,{" "}
              <code className="text-ink-dim">AGENTS.md</code> or <code className="text-ink-dim">.git</code>, so the
              wrong folder can&apos;t quietly give you a low score.
            </li>
            <li>
              The agent runs <code className="text-ink-dim">node &lt;skill-dir&gt;/dist/index.js .</code>. It&apos;s one
              file (built with ncc) that needs only Node and never uses the network.
            </li>
            <li>
              It runs the same sixteen checks this site uses (AGENTS.md, CI, tests, README, linter, dev setup, license,
              contributing guide, pre-commit, dependency list, type config, codebase size, plus four agent-specific
              instruction files) and gives a score for each agent.
            </li>
            <li>
              The agent picks the highest score as the best fit (no matter which agent ran the skill) and suggests a
              type of model using the table below. Switching models is left to you.
            </li>
          </ol>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Which model for which score</PanelHeading>

          <p className="m-0 mb-3 text-[13px] text-muted">
            This doesn&apos;t favor any provider. The skill suggests a <em>type</em> of model. You pick the exact model
            for your agent and switch with <code className="text-ink-dim">/model</code> (or your agent&apos;s
            equivalent).
          </p>

          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full border-separate border-spacing-0 text-[13.5px]">
              <thead>
                <tr className="bg-surface-2 [&>th]:border-b [&>th]:border-line [&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:text-[11.5px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-muted">
                  <th scope="col">Band</th>
                  <th scope="col">Score</th>
                  <th scope="col">Suggested model</th>
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
          <PanelHeading tone="info">Optional: score at the start of every session</PanelHeading>
          <p className="m-0 mb-3 text-[14.5px] leading-relaxed text-ink-dim">
            If your agent supports session-start hooks, the skill can print a one-line summary at the start of every
            session. Add one of these to the matching settings file:
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
            Cursor, Cline, and Copilot don&apos;t have a session-start hook yet. Instead, paste the same{" "}
            <code className="text-ink-dim">node ... --summary</code> command into{" "}
            <code className="text-ink-dim">.cursorrules</code> / <code className="text-ink-dim">.clinerules</code> as a
            fixed instruction, or run <code className="text-ink-dim">/agent-friendly</code> yourself whenever you want a
            new score.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Works on its own</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The scoring code and weights are packed into <code className="text-ink-dim">dist/index.js</code> with{" "}
            <code className="text-ink-dim">@vercel/ncc</code> and saved in the skill repo. Every run only reads files on
            your computer: no network, no call to this site, no token. If {APP_NAME} disappears, the skill keeps
            working. The scoring code is copied from {APP_NAME}&apos;s{" "}
            <code className="text-ink-dim">lib/scoring/</code> (this site&apos;s source) and kept in sync by hand, as
            described in its AGENTS.md.
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
            <ExternalLink href={SKILL_REPO_URL} iconSize={12}>
              {SKILL_REPO_URL.replace(/^https:\/\//, "")}
            </ExternalLink>{" "}
            — MIT-licensed, with version tags. A sister project to{" "}
            <ExternalLink href={ACTION_REPO_URL}>agent-friendly-action</ExternalLink>. Both use the same scoring code.
          </p>
        </Panel>
      </div>
    </>
  );
}
