import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { staticPageMetadata } from "@/lib/page-meta";
import { ROADMAP } from "@/lib/roadmap";
import { REPO_URL } from "@/lib/version";

export const metadata: Metadata = staticPageMetadata("/roadmap");

export default function RoadmapPage() {
  return (
    <>
      <PageHeader
        crumbs={{ current: { name: "Roadmap", path: "/roadmap" } }}
        title="Roadmap"
        lead="What's coming next. Each item links to its task file: the plan, what counts as done, and known limits."
      />

      <div className="flex flex-col gap-3.5">
        {ROADMAP.map((v) => (
          <Panel key={v.version}>
            <div className="mb-3 flex flex-wrap items-baseline gap-3.5">
              <h2 className="m-0 mr-auto flex flex-wrap items-baseline gap-3.5 text-[16px] font-semibold tracking-tight">
                <span className="chip border-line bg-surface-2 font-mono font-semibold tracking-normal text-accent">
                  {v.version}
                </span>
                {v.theme}
              </h2>

              <span className="chip eyebrow border-line bg-surface-2 text-muted">{v.status.replace("_", " ")}</span>
            </div>

            <ul className="m-0 list-none p-0">
              {v.items.map((it) => (
                <li
                  key={it.title}
                  className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0 sm:grid sm:grid-cols-[1fr_auto] sm:items-start sm:gap-4"
                >
                  <div>
                    <h3 className="m-0 text-[15px] font-medium">{it.title}</h3>
                    <div className="mt-1 text-[13.5px] text-ink-dim">{it.summary}</div>
                  </div>

                  {it.taskFile && (
                    <a
                      rel="noopener noreferrer"
                      target="_blank"
                      href={`${REPO_URL}/blob/main/${it.taskFile}`}
                      aria-label={`Open ${it.taskFile} on GitHub (new tab)`}
                      className="tap-target chip mt-1 max-w-full self-start [overflow-wrap:anywhere] border-line bg-surface-2 font-mono text-muted hover:text-ink-soft"
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
