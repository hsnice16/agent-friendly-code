import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ExternalLink } from "@/components/ExternalLink";
import { Panel, PanelHeading } from "@/components/Panel";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/version";

const LAST_UPDATED = "May 19, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
  twitter: { title: `Privacy Policy — ${APP_NAME}` },
  openGraph: { title: `Privacy Policy — ${APP_NAME}`, url: "/privacy", type: "article" },
  description: `How ${APP_NAME} handles visitor data: what we collect, what we don't, the third-party services we embed, and how to contact us about your data.`,
};

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
      </section>

      <Panel>
        <PanelHeading>Overview</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          <span className="mr-0.5">{APP_NAME}</span> (the &ldquo;Service&rdquo;) is operated by Himanshu Singh as an
          independent, MIT-licensed project. There are no user accounts. The Service is a public, read-only dashboard
          that ranks publicly accessible source repositories. This policy explains the limited information that is
          collected when you visit and how it is used.
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What we collect</PanelHeading>

          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            <li>
              <strong className="text-ink">Analytics.</strong> We use Google Analytics with IP anonymization enabled to
              measure aggregate traffic patterns — page views, referrers, approximate location, device and browser type,
              and time on page. This data is not used to identify individual visitors.
            </li>
            <li className="mt-2">
              <strong className="text-ink">Advertising.</strong> The Service may serve advertisements through Google
              AdSense. AdSense and its partners use cookies and similar technologies to serve ads and measure their
              performance. You can manage personalised advertising at{" "}
              <ExternalLink href="https://myadcenter.google.com">myadcenter.google.com</ExternalLink>.
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
          </ul>

          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">
            We do <strong className="text-ink mr-0.5">not</strong> ask for, or store, your name, email address, payment
            details, account credentials, or any content you submit — beyond information you optionally include in
            GitHub issues filed via links from this Service (which are governed by GitHub&apos;s own privacy policy).
          </p>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Cookies</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            The Service itself does not set first-party cookies. Cookies may be set by the third-party services we embed
            — Google Analytics (for usage measurement) and Google AdSense (for advertising). You can disable or delete
            cookies in your browser at any time; doing so will not break the Service, only analytics and advertising
            features will be affected.
          </p>
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
              Google AdSense —{" "}
              <ExternalLink href="https://policies.google.com/technologies/ads">
                policies.google.com/technologies/ads
              </ExternalLink>
              .
            </li>
            <li className="mt-1">
              Vercel (hosting) —{" "}
              <ExternalLink href="https://vercel.com/legal/privacy-policy">
                vercel.com/legal/privacy-policy
              </ExternalLink>
              .
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
            Aggregate analytics data is retained per Google Analytics&apos; default retention. We do not maintain a
            separate database of visitor information.
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
