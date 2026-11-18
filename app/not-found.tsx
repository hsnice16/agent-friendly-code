import type { Metadata } from "next";
import { NotFoundView } from "@/components/NotFoundView";
import { APP_NAME, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const TITLE = "Not found";
const DESCRIPTION = `There is no page at this address on ${APP_NAME}.`;

export const metadata: Metadata = {
  title: TITLE,
  // Next tags this route noindex itself; the layout's `index, follow` is
  // emitted beside it, so it is restated here and the two tags agree.
  robots: { index: false, follow: true },
  // The layout's canonical is "/", which would tell crawlers every 404 is the home page.
  alternates: { canonical: null },
  description: DESCRIPTION,
  // Replaces the layout's, whose url "/" would claim this 404 is the home page.
  openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION },
};

/**
 * Reached most often from an unknown repo, score or package address rather
 * than a mistyped one, so the first thing on it is the page
 * that works for a repo we have never seen.
 */
export default function NotFound() {
  return <NotFoundView />;
}
