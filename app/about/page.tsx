import type { Metadata } from "next";
import Link from "next/link";

import { Panel, PanelHeading } from "@/components/Panel";
import { APP_NAME, REPO_URL } from "@/lib/version";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  twitter: { title: `About — ${APP_NAME}` },
  openGraph: { title: `About — ${APP_NAME}`, url: "/about" },
  description: `Who built ${APP_NAME}, why it exists, and what it isn't. Independent, MIT-licensed, no affiliation with any AI agent vendor.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">About</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Who built {APP_NAME}, why it exists, and what it deliberately isn&apos;t.
        </p>
      </section>

      <Panel>
        <PanelHeading>Who</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          Built and maintained by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/hsnice16"
            className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
          >
            Himanshu Singh
          </a>
          . Independent project — no affiliation with Anthropic, OpenAI, Google, Cognition, Anysphere, or any of the
          agent vendors ranked here.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Why this exists</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The gap between &ldquo;repo with a README&rdquo; and &ldquo;repo that actually helps an AI coding agent ship
            code&rdquo; keeps widening, and there&apos;s no public way to tell who&apos;s doing the work. {APP_NAME}{" "}
            tries to make that visible — per model, because the agents aren&apos;t interchangeable. Claude Code wants an
            AGENTS.md and a fast test loop; Cursor wants strong types and a skim-readable README; Devin wants a runnable
            dev environment with declared deps and tests. The same repository can score very differently across them,
            and a single overall number would hide that.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What it isn&apos;t</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            This is not a benchmark of agent performance. Today every score is derived from{" "}
            <strong className="text-ink">static signals</strong> — file existence and content-length checks on the
            cloned tree. No agent is actually run. Per-model rationales are derived from each agent&apos;s published
            documentation (sources are linked on the methodology page), but the weight values themselves are still
            pre-benchmark — not yet calibrated against measured agent success. Read the{" "}
            <Link
              href="/methodology"
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              methodology
            </Link>{" "}
            for the full picture, including the production-cut plan to replace pre-benchmark weights with measured ones.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Open source</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            MIT-licensed. The signal definitions, weight profiles, scoring code, seed list, and every score in the
            database are all in the{" "}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              source repository
            </a>
            . If a repo&apos;s score looks wrong, file an issue with a link and the rubric to revisit; if a signal is
            missing, propose one.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Contact</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            Best signal: open an issue or discussion on{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`${REPO_URL}/issues`}
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              GitHub
            </a>
            .
          </p>
        </Panel>
      </div>
    </>
  );
}
