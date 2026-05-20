import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ExternalLink } from "@/components/ExternalLink";
import { Panel, PanelHeading } from "@/components/Panel";
import { APP_NAME, CONTACT_EMAIL, REPO_URL } from "@/lib/version";

const LAST_UPDATED = "May 19, 2026";

export const metadata: Metadata = {
  title: "Terms of Use",
  alternates: { canonical: "/terms" },
  twitter: { title: `Terms of Use — ${APP_NAME}` },
  openGraph: { title: `Terms of Use — ${APP_NAME}`, url: "/terms", type: "article" },
  description: `Terms of Use for ${APP_NAME}: what the Service is, how you may use it, the limits of the scoring data, and the operator's disclaimers.`,
};

export default function TermsPage() {
  return (
    <>
      <BreadcrumbJsonLd current={{ name: "Terms of Use", path: "/terms" }} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Terms of Use</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          What {APP_NAME} is, how you may use it, and the limits of the information it provides.
        </p>
        <p className="mt-2 text-[13px] text-muted">Last updated: {LAST_UPDATED}.</p>
      </section>

      <Panel>
        <PanelHeading>Acceptance</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          By accessing or using <span className="mr-0.5">{APP_NAME}</span> (the &ldquo;Service&rdquo;), you agree to
          these Terms of Use. If you do not agree, please do not use the Service.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What we offer</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The Service is a free, public, read-only dashboard that ranks publicly accessible source-code repositories
            on GitHub, GitLab, and Bitbucket by static &ldquo;agent-friendliness&rdquo; signals — file-existence and
            content-length checks against a shallow clone of each repository&apos;s default branch. The Service is an
            informational tool, provided as-is, on an as-available basis.
          </p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
            The scoring is a directional signal derived from static heuristics. It is{" "}
            <strong className="text-ink">not</strong> a benchmark of how any AI coding agent actually performs on a
            repository, and it is not a substitute for your own evaluation.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Acceptable use</PanelHeading>
          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              Do not scrape, mirror, or abuse the Service or its API in ways that disrupt normal operation. Reasonable,
              polite programmatic access to the public endpoints is welcome.
            </li>
            <li className="mt-1">Do not use the Service to attempt to gain unauthorized access to any system.</li>
            <li className="mt-1">
              Do not submit content via linked GitHub issues that is unlawful, infringing, defamatory, or harmful.
            </li>
            <li className="mt-1">Do not misrepresent your affiliation with, or sponsorship by, the Service.</li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Public scoring data</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            Scores and signal results are computed by shallow-cloning the head of public repositories and running
            heuristics over the working tree. If you maintain a repository that appears here and believe its score is
            inaccurate, please open an issue on the{" "}
            <ExternalLink href={`${REPO_URL}/issues`}>source repository</ExternalLink> and we will revisit it.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Intellectual property</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The source code of the Service is released under the MIT License (see{" "}
            <ExternalLink href={`${REPO_URL}/blob/main/LICENSE`}>LICENSE</ExternalLink>). The textual content and visual
            design of this Service are © Himanshu Singh and provided for personal, non-commercial reading. All
            third-party trademarks (Claude Code, Cursor, Devin, Codex, Gemini, Aider, OpenHands, Pi, GitHub, GitLab,
            Bitbucket, and others) belong to their respective owners.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Third-party links and content</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The Service links to repositories on third-party code hosts, to package registries, and to vendor
            documentation. We are not responsible for the content, policies, or availability of those third-party sites.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Disclaimer</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, AND NON-INFRINGEMENT. Scores may be inaccurate, out of date, or incomplete.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Limitation of liability</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            To the maximum extent permitted by law, in no event shall the operator be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising
            out of or in connection with your use of the Service.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Changes to these terms</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            We may revise these Terms from time to time. The &ldquo;Last updated&rdquo; date reflects the most recent
            revision. Continued use of the Service after a change constitutes acceptance.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Contact</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            Questions or notices regarding these Terms:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              {CONTACT_EMAIL}
            </a>
            . See also our{" "}
            <Link
              href="/privacy"
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </Panel>
      </div>
    </>
  );
}
