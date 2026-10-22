import { ogCard, ogSiteUrl } from "@/lib/og-card";

// Not the next/og file convention under app/score/: unfurlers outside
// robots.ts's LINK_PREVIEW group obey its /score/ Disallow.
export const dynamic = "force-static";

export function GET() {
  return ogCard({
    heading: ["Live Score"],
    sub: "Paste a link to a public GitHub repo. See its score for each agent, from its latest commit.",
    footerRight: ogSiteUrl("/score"),
  });
}
