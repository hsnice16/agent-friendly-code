import type { Metadata } from "next";

import { CopySnippet } from "@/components/CopySnippet";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { CLAUDE_HOOK_SNIPPET, CODEX_HOOK_SNIPPET, SCORE_BANDS, SKILL_FAQ } from "@/lib/skill-content";
import { agentList } from "@/lib/utils/agent-list";
import { ACTION_REPO_URL, APP_URL, SKILL_INSTALL_CMD, SKILL_REPO_URL } from "@/lib/version";

export const metadata: Metadata = staticPageMetadata("/skill");

const FAQ_JSON_LD = {
  "@type": "FAQPage",
  mainEntity: SKILL_FAQ.map((entry) => ({
    "@type": "Question",
    name: entry.q,
    acceptedAnswer: { "@type": "Answer", text: entry.a },
  })),
};

const APPLICATION_JSON_LD = {
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
      description: PAGE_COPY["/skill"].description,
      publisher: { "@id": `${APP_URL}/#org` },
      operatingSystem: "macOS, Linux, Windows",
      applicationCategory: "DeveloperApplication",
      license: "https://opensource.org/licenses/MIT",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      softwareRequirements: "Node.js 20.9+, an AI coding agent supporting the vercel-labs/skills convention",
    },
  ],
};

export default function SkillPage() {
  return (
    <>
      <JsonLd data={APPLICATION_JSON_LD} />
      <JsonLd data={FAQ_JSON_LD} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">
          Agent Friendly Skill: score the repo you&apos;re in
        </h1>

        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Scores the repo you&apos;re working in for {MODELS.length} agents, on your own computer, and suggests a model
          class. The scorer is bundled in, so it runs offline.
        </p>
      </section>

      <Panel tone="warn">
        <PanelHeading tone="warn">Install</PanelHeading>
        <p className="m-0 mb-3 text-[14.5px] leading-relaxed text-ink-dim">
          The{" "}
          <ExternalLink href="https://github.com/vercel-labs/skills" tone="ink">
            vercel-labs/skills
          </ExternalLink>{" "}
          CLI adds the skill to every agent you have set up.
        </p>

        <CopySnippet text={SKILL_INSTALL_CMD} highlight="warn" />

        <p className="mt-3 text-[12.5px] text-muted">
          Then run <code className="text-ink-dim">/agent-friendly</code> (or however your agent runs skills) from the
          repo&apos;s top folder. You get all {MODELS.length} scores ({agentList()}) whichever agent runs it.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>How it works</PanelHeading>

          <ol className="m-0 ml-5 list-decimal text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              The agent runs <code className="text-ink-dim">node &lt;skill-dir&gt;/dist/index.js .</code>, one bundled
              file that needs only Node and never uses the network.
            </li>
            <li>
              It scores the current folder and warns if it has no project file (such as{" "}
              <code className="text-ink-dim">package.json</code>, <code className="text-ink-dim">go.mod</code>, a README
              or <code className="text-ink-dim">.git</code>), so the wrong folder can&apos;t quietly score low.
            </li>
            <li>It runs the same {SIGNALS.length} checks as this site and scores each agent with the same weights.</li>
            <li>
              It names the agent the repo is best set up for and suggests a model class from the table below. Switching
              models is up to you.
            </li>
          </ol>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Which model for which score</PanelHeading>

          <p className="m-0 mb-3 text-[13px] text-muted">
            A model class, not a provider. Pick the exact model and switch with{" "}
            <code className="text-ink-dim">/model</code> (or your agent&apos;s equivalent).
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
            A session-start hook hands your agent the repo&apos;s score at the start of every session. Add one of these
            to the matching settings file:
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
            In other agents, run <code className="text-ink-dim">/agent-friendly</code> whenever you want a fresh score.
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
            — MIT-licensed. Its scorer is a copy of this site&apos;s, shared with{" "}
            <ExternalLink href={ACTION_REPO_URL}>agent-friendly-action</ExternalLink>.
          </p>
        </Panel>
      </div>
    </>
  );
}
