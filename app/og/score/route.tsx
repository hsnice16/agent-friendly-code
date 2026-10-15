import { ogCard, ogSiteUrl } from "@/lib/og-card";

// Not the next/og file convention under app/score/: robots.txt disallows
// /score/ (one URL per repo anywhere), which would hide the image from the
// crawlers that build link previews.
export const dynamic = "force-static";

export function GET() {
  return ogCard({
    heading: ["Live Score"],
    sub: "Paste a link to a public GitHub repo. See its score for each agent, from its latest commit.",
    footerRight: ogSiteUrl("/score"),
  });
}
