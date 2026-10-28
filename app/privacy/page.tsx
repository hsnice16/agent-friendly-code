import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ConsentSettingsButton } from "@/components/ConsentSettingsButton";
import { ExternalLink } from "@/components/ExternalLink";
import { Panel, PanelHeading } from "@/components/Panel";
import { ANALYTICS_ON } from "@/lib/analytics-consent";
import { staticPageMetadata } from "@/lib/page-meta";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/version";

const LAST_UPDATED = "October 28, 2026";

export const metadata: Metadata = staticPageMetadata("/privacy");

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd current={{ name: "Privacy Policy", path: "/privacy" }} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Privacy Policy</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          What information <span className="mr-0.5">{APP_NAME}</span> collects when you visit, what it deliberately
          doesn&apos;t, and how to get in touch about your data.
        </p>
        <p className="mt-2 text-[13px] text-muted">Last updated: {LAST_UPDATED}.</p>
        <p className="mt-1 text-[13px] text-muted">
          Changed on {LAST_UPDATED}: Microsoft Clarity heatmaps and session recordings, and leaderboard search terms in
          analytics.
        </p>
      </section>

      <Panel>
        <PanelHeading>Overview</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          <span className="mr-0.5">{APP_NAME}</span> (the &ldquo;Service&rdquo;) is operated by Himanshu Singh as an
          independent, MIT-licensed project. There are no user accounts. The Service scores publicly accessible source
          repositories and ranks the ones it tracks. This policy explains the limited information that is collected when
          you visit and how it is used.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What we collect</PanelHeading>

          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              <strong className="text-ink">Analytics.</strong> We use Google Analytics 4, which does not log or store IP
              addresses, to measure aggregate traffic patterns — page views, leaderboard searches (the words searched
              and how many repos matched), filter and sort changes, Live Score results, package lookups, clicks on the
              share, badge, copy, agent and &ldquo;Score your repo&rdquo; buttons, referrers, approximate location,
              device and browser type, and time on page. This data is not used to identify individual visitors.
            </li>
            <li className="mt-2">
              <strong className="text-ink">Heatmaps and session recordings.</strong> We use Microsoft Clarity to see
              where visitors click and how far they scroll, and to replay visits as recordings of mouse movement, clicks
              and scrolling. Text typed into fields is masked before it leaves your browser, though a leaderboard search
              also appears in the page address.
            </li>
            <li className="mt-2">
              <strong className="text-ink">Server logs.</strong> Our hosting provider (Vercel) may record standard
              request metadata — IP address, user-agent, timestamps — for short retention periods, for operational and
              security purposes.
            </li>
            <li className="mt-2">
              <strong className="text-ink">Public repository data.</strong> Scores and signals shown on the Service are
              derived from public source repositories on GitHub, GitLab, and Bitbucket. No private code or non-public
              information is read or stored.
            </li>
            <li className="mt-2">
              <strong className="text-ink">Live Score.</strong> A repository URL you submit is sent from our server to
              GitHub to read that repository&apos;s public file list, its basic details, and the few files the checks
              read. The result is cached on our servers for up to one hour and is not added to our database. The page
              address, which includes the repository name, is recorded as a page view in analytics.
            </li>
            <li className="mt-2">
              <strong className="text-ink">Browser storage.</strong> The repositories you scored, with their scores, the
              last release notice you were shown, and your analytics choice are kept in your browser&apos;s
              localStorage. They are never sent to us, and clearing site data for this site removes them.
            </li>
          </ul>

          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
            We do <strong className="text-ink mr-0.5">not</strong> ask for, or store, your name, email address, payment
            details, account credentials, or any content you submit — beyond a repository URL sent to Live Score and
            leaderboard search terms, as described above, and information you optionally include in GitHub issues filed
            via links from this Service (which are governed by GitHub&apos;s own privacy policy).
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Cookies</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The Service&apos;s own code sets no cookies. Cookies may be set by Google Analytics and Microsoft Clarity,
            which we embed for usage measurement. The Service shows no advertising. You can disable or delete cookies in
            your browser at any time; doing so will not break the Service, only analytics will be affected.
          </p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
            For visitors from the European Economic Area, the United Kingdom, and Switzerland, Google Analytics sets no
            cookies until they accept, and sends only cookieless pings that carry no identifier. Microsoft Clarity sets
            no cookies for them until they accept. They can change their answer below; declining removes Clarity&apos;s
            cookies at once and stops it from loading on later pages.
          </p>
          {ANALYTICS_ON && (
            <ConsentSettingsButton className="mt-3 cursor-pointer rounded-md border border-line px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-hover" />
          )}
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Third-party services</PanelHeading>
          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              Google Analytics —{" "}
              <ExternalLink href="https://policies.google.com/privacy">policies.google.com/privacy</ExternalLink>.
            </li>
            <li className="mt-1">
              Microsoft Clarity —{" "}
              <ExternalLink href="https://www.microsoft.com/privacy/privacystatement">
                microsoft.com/privacy/privacystatement
              </ExternalLink>
              .
            </li>
            <li className="mt-1">
              Vercel (hosting) —{" "}
              <ExternalLink href="https://vercel.com/legal/privacy-notice">
                vercel.com/legal/privacy-notice
              </ExternalLink>
              .
            </li>
            <li className="mt-1">
              Peerlist and Product Hunt — pages load badge images from peerlist.io and api.producthunt.com, which
              receive your IP address and user-agent when the image loads.
            </li>
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Your rights (GDPR / UK GDPR / CCPA)</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            Because the Service does not associate visit data with you as an individual, in most cases there is no
            per-person data for us to access, correct, or delete. If you reside in the European Economic Area, the
            United Kingdom, or California, you nonetheless have the right to request information about, correct, delete,
            export, or object to the processing of any personal data we may hold about you. To exercise these rights,
            email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Data retention</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            Google Analytics keeps event data for 14 months. Microsoft Clarity keeps session recordings for 30 days, and
            heatmaps and a sample of recordings for up to 9 months. We do not maintain a separate database of visitor
            information.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Children&apos;s privacy</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The Service is not directed to children under 13, and we do not knowingly collect personal information from
            children.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Changes to this policy</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top reflects
            the most recent revision. Material changes will be summarised at the top of this page.
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Contact</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            Questions, requests, or concerns about this policy:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              {CONTACT_EMAIL}
            </a>
            . See also our{" "}
            <Link
              href="/terms"
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              Terms of Use
            </Link>
            .
          </p>
        </Panel>
      </div>
    </>
  );
}
