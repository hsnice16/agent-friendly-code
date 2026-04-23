import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Panel, PanelHeading } from "@/components/Panel";
import { ROADMAP } from "@/lib/roadmap";
import { REPO_URL } from "@/lib/version";

export const metadata: Metadata = {
  title: "Roadmap",
  twitter: { title: "Roadmap" },
  alternates: { canonical: "/roadmap" },
  openGraph: { title: "Roadmap", url: "/roadmap" },
  description:
    "What's planned for Agent Friendly Code: dogfooding, benchmark-derived weights, ecosystem integration (badges, PR diffs, webhooks, opt-out), discovery surfaces, history-aware signals, production stability, and at-scale GitHub indexing.",
};

export default function RoadmapPage() {
  return (
    <>
      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Roadmap</h1>
        <p className="m-0 max-w-[70ch] text-[15.5px] text-ink-dim">
          What&apos;s planned in upcoming versions. Each bullet links to a task file with the full spec, acceptance
          criteria, and caveats.
        </p>
      </section>

      <div className="flex flex-col gap-3.5">
        {ROADMAP.map((v) => (
          <Panel key={v.version}>
            <div className="mb-3 flex flex-wrap items-baseline gap-3.5">
              <span className="inline-block rounded-md border border-line bg-surface-2 px-2.5 py-[3px] font-mono text-[13px] font-semibold text-accent">
                {v.version}
              </span>
              <span className="mr-auto text-lg font-semibold tracking-tight">{v.theme}</span>
              <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs uppercase tracking-wide text-muted">
                {v.status.replace("_", " ")}
              </span>
            </div>

            <PanelHeading>Planned</PanelHeading>
            <ul className="m-0 list-none p-0">
              {v.items.map((it) => (
                <li
                  key={it.title}
                  className="grid grid-cols-[1fr_auto] items-start gap-4 border-b border-line py-3 last:border-b-0"
                >
                  <div>
                    <div className="text-[15px] font-medium">{it.title}</div>
                    <div className="mt-1 text-sm text-ink-dim">{it.summary}</div>
                  </div>

                  {it.taskFile && (
                    <a
                      rel="noopener"
                      target="_blank"
                      href={`${REPO_URL}/blob/main/${it.taskFile}`}
                      aria-label={`Open ${it.taskFile} on GitHub (new tab)`}
                      className="mt-1 inline-flex items-center gap-1 self-start whitespace-nowrap rounded border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11.5px] text-muted hover:text-ink-soft"
                    >
                      {it.taskFile}
                      <ArrowUpRight size={11} weight="bold" aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}
