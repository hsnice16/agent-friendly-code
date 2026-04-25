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

export default function MethodologyPage() {
  return (
    <>
      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Methodology</h1>

        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          How scores are computed today, what&apos;s being measured, and where the current approach stops short.
        </p>
      </section>

      <Panel className="border-warn/40">
        <PanelHeading>
          <span className="text-warn">Status: static parameters</span>
        </PanelHeading>

        <p className="text-[14.5px] leading-relaxed text-ink-dim">
          Today every score is derived from <strong className="text-ink">static signals</strong> — file existence and
          content-length checks on the cloned tree. No agent is actually run. Per-model weights are{" "}
          <strong className="text-ink">illustrative</strong>, not yet derived from measured agent success. This is
          enough to produce meaningfully different rankings and to show how the UX of per-model scoring feels, but it
          should not be read as a benchmark.
        </p>

        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
          The plan to replace illustrative weights with measured ones is part of the v1.0.0 production cut on the{" "}
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
              planned as v0.4.0 on the{" "}
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
