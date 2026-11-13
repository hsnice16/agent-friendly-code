import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const TITLE = "Package not found";
const DESCRIPTION = "The registry doesn't list a package by this name.";

// Restated as in app/not-found.tsx: the layout's index, canonical and OG url would claim this 404 is the home page.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: { ...OG_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION },
};

// Also reached for a registry we don't read, so the copy names the ones we do.
export default function PackageNotFound() {
  return (
    <>
      <PageHeader
        title={TITLE}
        lead="The registry doesn't list a package by this name, or it isn't one we read (npm, PyPI and crates.io)."
      />

      <Panel tone="tip">
        <PanelHeading tone="tip">Check the spelling</PanelHeading>
        <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
          Names are looked up exactly as the registry spells them, scope included (<code>@scope/name</code> on npm).{" "}
          <Link href="/package" className="prose-link">
            Look up another package
          </Link>
          , or paste the repo link into{" "}
          <Link href="/score" className="prose-link">
            Live Score
          </Link>
          .
        </p>
      </Panel>
    </>
  );
}
