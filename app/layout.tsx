import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

import { BackToTop } from "@/components/BackToTop";
import { BoardPendingScript } from "@/components/BoardPendingScript";
import { Clarity } from "@/components/Clarity";
import { ConsentBanner } from "@/components/ConsentBanner";
import { FooterDirectory } from "@/components/FooterDirectory";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { MobileNav } from "@/components/MobileNav";
import { PeerlistBadge } from "@/components/PeerlistBadge";
import { ProductHuntBadge } from "@/components/ProductHuntBadge";
import { SkillsShBadge } from "@/components/SkillsShBadge";
import { VersionPill } from "@/components/VersionPill";
import { examplesByFramework } from "@/lib/agents-md-frameworks";
import { ANALYTICS_ON } from "@/lib/analytics-consent";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { checkSubPath } from "@/lib/utils/check-path";
import { BRAND_SUFFIX } from "@/lib/utils/page-title";
import { APP_DESCRIPTION, APP_NAME, APP_URL, OG_DEFAULTS, REPO_URL, TWITTER_DEFAULTS } from "@/lib/version";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  creator: "Himanshu Singh",
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  authors: [{ name: "Himanshu Singh", url: REPO_URL }],
  title: { default: APP_NAME, template: `%s${BRAND_SUFFIX}` },
  openGraph: {
    ...OG_DEFAULTS,
    url: "/",
    title: APP_NAME,
    type: "website",
    description: APP_DESCRIPTION,
  },
  twitter: {
    ...TWITTER_DEFAULTS,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-video-preview": -1,
      "max-image-preview": "large",
    },
  },
};

const JSON_LD = {
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#org`,
      url: APP_URL,
      name: APP_NAME,
      sameAs: [REPO_URL],
      logo: `${APP_URL}/icon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#site`,
      url: APP_URL,
      name: APP_NAME,
      description: APP_DESCRIPTION,
      publisher: { "@id": `${APP_URL}/#org` },
    },
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/#app`,
      url: APP_URL,
      name: APP_NAME,
      operatingSystem: "Any",
      isAccessibleForFree: true,
      description: APP_DESCRIPTION,
      publisher: { "@id": `${APP_URL}/#org` },
      applicationCategory: "DeveloperApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      browserRequirements: "Requires JavaScript-enabled modern browser",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

// Alphabetical by label — a new entry has exactly one place to go.
const NAV_LINKS = [
  { href: "/skill", label: "Agent Skill" },
  { href: "/action", label: "GitHub Action" },
  { href: "/score", label: "Live Score" },
  { href: "/methodology", label: "Methodology" },
];

const FOOTER_LINKS_PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/guide", label: "Guide" },
  { href: checkSubPath("agents_md", "examples"), label: "AGENTS.md examples" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/changelog", label: "Changelog" },
];

const FOOTER_LINKS_TOOLS = [
  { href: "/skill", label: "Agent Skill" },
  { href: "/action", label: "GitHub Action" },
  { href: "/score", label: "Live Score" },
  { href: "/package", label: "Packages" },
];

const FOOTER_LINKS_LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

// On the row, not each link: one class string instead of one per link.
const FOOTER_LINKS_CLASS = "[&_a]:prose-link";

// No prefetch: the footer is on every page, and each prefetched link is a billed ISR read.
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} prefetch={false} className="tap-target">
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The board's pending mark is set on <html> before hydration (BoardPendingScript).
    // data-scroll-behavior lets Next pause globals.css's smooth scroll on navigation: left
    // gliding, its reset to the top is unfinished when checked, and the h1 lands under the header.
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <BoardPendingScript />
      </head>
      <body>
        <JsonLd data={JSON_LD} />
        <GoogleAnalytics />
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && <Clarity />}
        {ANALYTICS_ON && <ConsentBanner />}

        <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/60 backdrop-blur-md backdrop-saturate-150">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-3 py-3 sm:px-6">
            <Link
              href="/"
              className="tap-target flex items-center gap-2.5 text-[15px] font-semibold tracking-tight ink-link"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[13px] font-bold text-accent-ink"
              >
                A
              </span>
              {APP_NAME}
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-4 text-[13.5px] md:flex">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-ink-dim hover:text-ink-soft">
                  {l.label}
                </Link>
              ))}
              <VersionPill />
            </nav>

            <MobileNav links={NAV_LINKS} />
          </div>
        </header>

        <div className="mx-auto max-w-[1080px] px-3 pb-20 pt-8 sm:px-6 sm:pt-10">
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <footer className="mt-12 border-t border-line pt-8 text-[13px] leading-[1.7] text-muted">
            <FooterDirectory frameworks={examplesByFramework(getAgentsMdExamples()).map((f) => f.guide)} />

            <p className="m-0">
              Scores come from checking files in each repo. No agent is actually run. What each agent looks for comes
              from its own docs, but how much each check counts is still our best guess, not yet tested.
            </p>

            <SkillsShBadge className="mt-5" />

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <PeerlistBadge />
              <ProductHuntBadge />
            </div>

            <div
              className={`mt-12 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8 ${FOOTER_LINKS_CLASS}`}
            >
              {/* Each separator trails its item, so a wrapped line never starts with one. */}
              <p className="m-0 order-2 flex flex-wrap items-center gap-x-1.5 gap-y-[24px] text-[12px] sm:order-1 sm:gap-y-1">
                <span>
                  © {new Date().getFullYear()}{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/hsnice16"
                    className="tap-target"
                  >
                    Himanshu Singh
                  </a>
                  <span aria-hidden="true"> ·</span>
                </span>

                <span>
                  also made{" "}
                  <a target="_blank" rel="noopener" href="https://usetu.la/" className="tap-target">
                    tula — crypto liquidation risk CLI
                  </a>
                  <span aria-hidden="true"> ·</span>
                </span>

                <span>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${REPO_URL}/blob/main/LICENSE`}
                    className="tap-target"
                  >
                    MIT
                  </a>
                  <span aria-hidden="true"> ·</span>
                </span>

                {FOOTER_LINKS_LEGAL.map((l, i) => (
                  <span key={l.href}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                    {i < FOOTER_LINKS_LEGAL.length - 1 && <span aria-hidden="true"> ·</span>}
                  </span>
                ))}
              </p>

              <nav aria-label="Secondary" className="order-1 grid grid-cols-2 gap-x-12 sm:order-2 sm:gap-x-16">
                <div className="flex flex-col items-start gap-[22px] sm:gap-1">
                  {FOOTER_LINKS_PRIMARY.map((l) => (
                    <FooterLink key={l.href} href={l.href}>
                      {l.label}
                    </FooterLink>
                  ))}
                </div>

                <div className="flex flex-col items-start gap-[22px] sm:gap-1">
                  {FOOTER_LINKS_TOOLS.map((l) => (
                    <FooterLink key={l.href} href={l.href}>
                      {l.label}
                    </FooterLink>
                  ))}
                </div>
              </nav>
            </div>
          </footer>
        </div>

        <BackToTop />
      </body>
    </html>
  );
}
