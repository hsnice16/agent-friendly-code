import type { Metadata } from "next";
import Link from "next/link";

import { CodeText } from "@/components/CodeText";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { CHANGELOG } from "@/lib/changelog";
import { staticPageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = staticPageMetadata("/changelog");

export default function ChangelogPage() {
  return (
    <>
      <PageHeader
        crumbs={{ current: { name: "Changelog", path: "/changelog" } }}
        title="Changelog"
        lead={
          <>
            What each release shipped from the{" "}
            <Link href="/roadmap" className="prose-link">
              roadmap
            </Link>
            .
          </>
        }
      />

      <div className="flex flex-col gap-3.5">
        {CHANGELOG.map((entry) => (
          <Panel key={entry.label}>
            <div className="mb-2.5 flex flex-wrap items-baseline gap-3.5">
              <h2 className="m-0 mr-auto flex flex-wrap items-baseline gap-3.5 text-[16px] font-semibold tracking-tight">
                <span className="chip border-line bg-surface-2 font-mono font-semibold tracking-normal text-accent">
                  {entry.label}
                </span>
                {entry.title}
              </h2>

              <span className="tabular-nums text-[13px] text-muted">{entry.date}</span>
            </div>

            <ul className="m-0 list-none p-0 text-[14.5px] text-ink-dim">
              {entry.highlights.map((h) => (
                <li key={h} className="my-1 flex gap-2">
                  <span aria-hidden="true" className="select-none text-line">
                    ·
                  </span>
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    <CodeText text={h} />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </>
  );
}
