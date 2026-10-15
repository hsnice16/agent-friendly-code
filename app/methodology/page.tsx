import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CodeText } from "@/components/CodeText";
import { ExternalLink } from "@/components/ExternalLink";
import { JsonLd } from "@/components/JsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { weightsChangedText } from "@/lib/changelog";
import { sourceLabel } from "@/lib/leaderboard-model-panel";
import { staticPageMetadata } from "@/lib/page-meta";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { checkPath } from "@/lib/utils/check-path";
import { APP_NAME } from "@/lib/version";
import { METHODOLOGY_FAQ } from "./faq";

export const metadata: Metadata = staticPageMetadata("/methodology");

const FAQ_JSON_LD = {
  "@type": "FAQPage",
  mainEntity: METHODOLOGY_FAQ.map((entry) => ({
    "@type": "Question",
    name: entry.q,
    acceptedAnswer: { "@type": "Answer", text: entry.a },
  })),
};

export default function MethodologyPage() {
  return (
    <>
      <BreadcrumbJsonLd current={{ name: "Methodology", path: "/methodology" }} />
      <JsonLd data={FAQ_JSON_LD} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">How {APP_NAME} scores repos</h1>

        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          How we work out each score, what we check, and what we can&apos;t check yet.
        </p>
        <p className="mt-2 mb-0 text-[13px] text-muted">{weightsChangedText()}</p>
      </section>

      <Panel tone="warn">
        <PanelHeading tone="warn">Weights from docs, not yet tested</PanelHeading>

        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          Every score comes from <strong className="text-ink">file checks</strong>: does a file exist, and how long is
          it. No agent is run. Each agent&apos;s weights follow <strong className="text-ink">its own docs</strong> (see
          Sources under each agent), but the numbers are not yet measured against real agent runs. That is planned for
          v1.0.0 on the{" "}
          <Link href="/roadmap" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
            roadmap
          </Link>
          ; until then, treat scores as a guide, not a verdict.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Score formula</PanelHeading>
          <pre className="m-0 overflow-x-auto rounded-lg border border-line bg-surface-2 px-4 py-3.5 font-mono text-[13px] leading-relaxed text-ink-dim">
            {`per-agent score = Σ(check.pass × agent.weight[check]) / Σ(agent.weight) × 100
overall         = mean(per-agent scores)
improvement     = closing a gap unlocks  (1 - pass) × weight / Σweight × 100  points`}
          </pre>

          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-dim">
            <code className="font-mono text-[12.5px] text-ink">check.pass</code> is a number from{" "}
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
                  <Link href={checkPath(s.id)} className="text-[14.5px] font-medium text-ink hover:text-ink-soft">
                    {s.label}
                  </Link>
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

      <div id="agents" className="mt-3.5 scroll-mt-20">
        <Panel>
          <PanelHeading>AI agents and their weights ({MODELS.length})</PanelHeading>

          <nav aria-label="Agents" className="mt-2 mb-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
            {MODELS.map((m) => (
              <a
                key={m.id}
                href={`#model-${m.id}`}
                className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline"
              >
                {m.label}
              </a>
            ))}
          </nav>

          <ul className="m-0 list-none p-0">
            {MODELS.map((m) => (
              <li key={m.id} id={`model-${m.id}`} className="scroll-mt-20 border-b border-line py-3 last:border-b-0">
                <div className="text-[15px] font-medium">{m.label}</div>
                <div className="mt-1 text-[13.5px] text-ink-dim">{m.rationale}</div>

                {m.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px] text-muted">
                    <span>Sources:</span>

                    {m.sources.map((url) => (
                      <ExternalLink key={url} href={url} title={url}>
                        {sourceLabel(url)}
                      </ExternalLink>
                    ))}
                  </div>
                )}

                <details className="mt-2 text-[13px] text-muted">
                  <summary className="cursor-pointer">Weights</summary>

                  <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs leading-relaxed">
                    {Object.entries(m.weights)
                      .sort(([, a], [, b]) => b - a)
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
              Anything from commit history, such as activity or contributor count. Clones are{" "}
              <code className="rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-xs">
                --depth 1 --single-branch
              </code>
              , and history says more about a repo&apos;s health than about how agents work in it.
            </li>

            <li>How well agents actually do on the repo. That comes with the v1.0.0 benchmark.</li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Questions</PanelHeading>
          <dl className="m-0">
            {METHODOLOGY_FAQ.map((entry) => (
              <div key={entry.q} className="border-b border-line py-3.5 first:pt-0 last:border-b-0 last:pb-0">
                <dt className="m-0 text-[14.5px] font-semibold text-ink">{entry.q}</dt>
                <dd className="m-0 mt-1.5 text-[14px] leading-relaxed text-ink-dim">
                  <CodeText text={entry.a} />
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}
