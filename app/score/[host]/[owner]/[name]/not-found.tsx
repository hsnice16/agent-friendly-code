import type { Metadata } from "next";

import { LiveScoreUnavailable } from "@/components/LiveScoreUnavailable";

export const metadata: Metadata = { title: "Couldn't score this repo", robots: { index: false } };

export default function LiveScoreNotFound() {
  return (
    <LiveScoreUnavailable
      outcome="not_found"
      reason="We couldn't find a public repo with that name. Check the owner and repo name."
    />
  );
}
