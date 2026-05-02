import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

import { BackToTop } from "@/components/BackToTop";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MobileNav } from "@/components/MobileNav";
import { VersionPill } from "@/components/VersionPill";
import { APP_DESCRIPTION, APP_KEYWORDS, APP_NAME, APP_URL, REPO_URL } from "@/lib/version";

const OG_IMAGE = {
  width: 1200,
  height: 630,
  url: "/demo/light.png",
  alt: `${APP_NAME} — public leaderboard`,
};

export const metadata: Metadata = {
  keywords: APP_KEYWORDS,
  applicationName: APP_NAME,
  creator: "Himanshu Singh",
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  authors: [{ name: "Himanshu Singh", url: REPO_URL }],
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  openGraph: {
    url: "/",
    locale: "en_US",
    title: APP_NAME,
    type: "website",
    images: [OG_IMAGE],
    siteName: APP_NAME,
    description: APP_DESCRIPTION,
  },
  twitter: {
    title: APP_NAME,
    images: [OG_IMAGE.url],
    card: "summary_large_image",
    description: APP_DESCRIPTION,
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

const JSON_LD = {
  "@context": "https://schema.org",
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
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${APP_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
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

const NAV_LINKS = [
  { href: "/action", label: "GitHub Action" },
  { href: "/skill", label: "Agent Skill" },
  { href: "/methodology", label: "Methodology" },
];

const FOOTER_LINKS_PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/changelog", label: "Changelog" },
];

const FOOTER_LINKS_TOOLS = [
  { href: "/skill", label: "Agent Skill" },
  { href: "/action", label: "GitHub Action" },
  { href: "/package", label: "Packages" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content; payload is server-controlled and `<` is escaped
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
          }}
        />
        <GoogleAnalytics />

        <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/60 backdrop-blur-md backdrop-saturate-150">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-3 py-3 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[13px] font-bold text-accent-ink"
              >
                A
              </div>
              <div className="text-[15px] font-semibold tracking-tight">
                <Link href="/" className="text-ink hover:text-ink-soft">
                  {APP_NAME}
                </Link>
              </div>
            </div>

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
          <main id="main">{children}</main>
          <footer className="mt-12 border-t border-line pt-5 text-[13px] leading-[1.7] text-muted">
            <p className="m-0">
              Signals are static heuristics — no agent is actually run. Per-model rationales are docs-cited; the weight
              values themselves are still pre-benchmark.
            </p>

            <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <p className="m-0 order-2 text-[12px] sm:order-1">
                © {new Date().getFullYear()}{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/hsnice16"
                  className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
                >
                  Himanshu Singh
                </a>{" "}
                ·{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${REPO_URL}/blob/main/LICENSE`}
                  className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
                >
                  MIT
                </a>
              </p>

              <nav aria-label="Secondary" className="order-1 grid grid-cols-2 gap-x-12 sm:order-2 sm:gap-x-16">
                <div className="flex flex-col items-start gap-1">
                  {FOOTER_LINKS_PRIMARY.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col items-start gap-1">
                  {FOOTER_LINKS_TOOLS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
                    >
                      {l.label}
                    </Link>
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
