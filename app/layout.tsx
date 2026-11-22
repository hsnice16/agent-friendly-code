import type { Metadata, Viewport } from "next";
import "./globals.css";

import { BackToTop } from "@/components/BackToTop";
import { BoardPendingScript } from "@/components/BoardPendingScript";
import { Clarity } from "@/components/Clarity";
import { ConsentBanner } from "@/components/ConsentBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ANALYTICS_ON } from "@/lib/analytics-consent";
import { footerDirectoryRows } from "@/lib/footer-directory";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

const FOOTER_LINKS_PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/guide", label: "Guide" },
  { href: checkSubPath("agents_md", "examples"), label: "AGENTS.md examples" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/changelog", label: "Changelog" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The board's pending mark is set on <html> before hydration (BoardPendingScript).
    // data-scroll-behavior lets Next pause globals.css's smooth scroll on navigation: left
    // gliding, its reset to the top is unfinished when checked, and the h1 lands under the header.
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <BoardPendingScript />
        {/* Not metadata.alternates: a page's own `alternates.canonical` replaces the whole object. */}
        <link rel="alternate" type="application/atom+xml" title={`${APP_NAME} changelog`} href="/changelog.xml" />
      </head>
      <body>
        <GoogleAnalytics />
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && <Clarity />}
        {ANALYTICS_ON && <ConsentBanner />}

        <SiteHeader />

        <div className="mx-auto max-w-[1080px] px-3 pb-20 pt-8 sm:px-6 sm:pt-10">
          <main id="main" tabIndex={-1} className="min-h-[60vh] outline-none">
            {children}
          </main>
          <SiteFooter
            directory={footerDirectoryRows()}
            primary={FOOTER_LINKS_PRIMARY}
            year={new Date().getFullYear()}
          />
        </div>

        <BackToTop />
      </body>
    </html>
  );
}
