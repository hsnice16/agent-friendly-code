import type { Metadata } from "next";

import { LiveScoreUnavailable } from "@/components/LiveScoreUnavailable";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const TITLE = "Couldn't score this repo";

// Restated as in app/not-found.tsx: the layout's index, canonical and OG url would claim this 404 is the home page.
export const metadata: Metadata = {
  title: TITLE,
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE, type: "website" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE },
};

export default function LiveScoreNotFound() {
  return (
    <LiveScoreUnavailable
      outcome="not_found"
      reason="We couldn't find a public repo with that name. Check the owner and repo name."
    />
  );
}
