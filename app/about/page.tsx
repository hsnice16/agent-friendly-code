import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ExternalLink } from "@/components/ExternalLink";
import { Panel, PanelHeading } from "@/components/Panel";
import { APP_NAME, APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, REPO_URL, TWITTER_DEFAULTS } from "@/lib/version";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: `About — ${APP_NAME}` },
  openGraph: {
    ...OG_DEFAULTS,
    images: [DEFAULT_OG_IMAGE],
    title: `About — ${APP_NAME}`,
    url: "/about",
    type: "article",
  },
  description: `Who built ${APP_NAME}, why, and what it is not. Independent, MIT-licensed, and not tied to any AI agent company.`,
};

const ABOUT_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${APP_URL}/about#author`,
      "@type": "Person",
      name: "Himanshu Singh",
      jobTitle: "Software Engineer",
      url: "https://github.com/hsnice16",
      worksFor: { "@id": `${APP_URL}/#org` },
      sameAs: ["https://github.com/hsnice16", "https://github.com/sponsors/hsnice16"],
    },
    {
      "@id": `${APP_URL}/about#page`,
      "@type": "AboutPage",
      url: `${APP_URL}/about`,
      name: `About — ${APP_NAME}`,
      author: { "@id": `${APP_URL}/about#author` },
      isPartOf: { "@id": `${APP_URL}/#site` },
      mainEntity: { "@id": `${APP_URL}/about#author` },
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd current={{ name: "About", path: "/about" }} />

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built JSON-LD; `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(ABOUT_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">About</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">Who built {APP_NAME}, why, and what it is not.</p>
      </section>

      <Panel>
        <PanelHeading>Who</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          Built and maintained by <ExternalLink href="https://github.com/hsnice16">Himanshu Singh</ExternalLink>. It is
          an independent project, not tied to Anthropic, OpenAI, Google, Cognition, Anysphere, or any other company
          whose agent is ranked here.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel tone="warn">
          <PanelHeading tone="warn">Why it exists</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            A repo that has a README is not the same as a repo that really helps an AI coding agent get work done. That
            gap keeps growing, and there is no public way to see which repos have done the work. {APP_NAME} tries to
            show it, for each agent separately, because the agents are not the same. Claude Code wants an AGENTS.md and
            fast tests. Cursor wants strong types and a README that is easy to skim. Devin wants a dev setup it can run,
            with its dependencies and tests listed. One repo can score very differently for each of them. A single
            number would hide that.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What it is not</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            It is not a test of how well agents perform. Every score comes from{" "}
            <strong className="text-ink">simple file checks</strong>: does a file exist, and how long is it. No agent is
            actually run. The reasons behind each agent&apos;s weights come from that agent&apos;s own docs (linked on
            the methodology page). But the weight numbers are not yet tested against how agents really perform. Read the{" "}
            <Link
              href="/methodology"
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              methodology
            </Link>{" "}
            for the details, including the plan to replace these weights with measured ones.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Open source</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            MIT-licensed. The checks, the weights, the scoring code, the list of repos, and every score are all in the{" "}
            <ExternalLink href={REPO_URL}>source repository</ExternalLink>. If a score looks wrong, open an issue with a
            link and say which rule to look at again. If a check is missing, suggest one.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Contact</PanelHeading>

          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The best way to reach me: open an issue or discussion on{" "}
            <ExternalLink href={`${REPO_URL}/issues`}>GitHub</ExternalLink>.
          </p>
        </Panel>
      </div>
    </>
  );
}
