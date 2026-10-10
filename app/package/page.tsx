import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { PackageLookupForm } from "@/components/PackageLookupForm";
import { Panel, PanelHeading } from "@/components/Panel";
import { getTopPackagesByRegistry } from "@/lib/db";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const DESCRIPTION = "Look up an npm, PyPI, or Cargo package to see how ready its source repo is for AI coding agents.";

export const metadata: Metadata = {
  title: "Packages",
  description: DESCRIPTION,
  alternates: { canonical: "/package" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: "Packages", description: DESCRIPTION },
  openGraph: {
    ...OG_DEFAULTS,
    images: [DEFAULT_OG_IMAGE],
    title: "Packages",
    description: DESCRIPTION,
    url: "/package",
    type: "website",
  },
};

const EXAMPLES = [
  { registry: "npm", name: "axios" },
  { registry: "npm", name: "react" },
  { registry: "cargo", name: "serde" },
  { registry: "pypi", name: "requests" },
] as const;

const TOP_REGISTRIES = ["npm", "pypi", "cargo"] as const;
const TOP_LIMIT_PER_REGISTRY = 6;

export default function PackageIndexPage() {
  const topRows = TOP_REGISTRIES.flatMap((registry) =>
    getTopPackagesByRegistry(registry, TOP_LIMIT_PER_REGISTRY).map((row) => ({ registry, ...row })),
  ).sort((a, b) => b.score - a.score);

  return (
    <>
      <BreadcrumbJsonLd current={{ name: "Packages", path: "/package" }} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Packages</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          People usually pick packages on npm, PyPI, or crates.io, not on GitHub. Type a package name to see how ready
          its source repo is for AI coding agents.
        </p>
      </section>

      <Panel tone="warn">
        <PanelHeading tone="warn">Look up a package</PanelHeading>

        <PackageLookupForm />

        <p className="mt-3 text-[13.5px] text-muted">
          Want JSON instead? <code className="text-ink-dim">/api/package/&lt;registry&gt;/&lt;name&gt;</code>
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Try one</PanelHeading>

          <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
            {EXAMPLES.map(({ registry, name }) => (
              <li key={`${registry}/${name}`}>
                <Link
                  href={`/package/${registry}/${name}`}
                  className="block rounded-lg border border-line bg-surface-2 px-3.5 py-3 text-ink"
                >
                  <span className="font-mono text-[13px] text-muted">{registry}</span>
                  <span className="mx-1.5 text-muted">/</span>
                  <span className="font-medium">{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>What if a package has no score yet?</PanelHeading>
          <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
            If the package&apos;s source repo isn&apos;t on our list yet, the page shows which repo we found. It also
            links to a <strong className="text-ink mr-1">ready-made GitHub issue</strong> you can send to ask us to
            score it. If the package doesn&apos;t list a source link we can read, the issue asks you for the right link.
          </p>
        </Panel>
      </div>

      {topRows.length > 0 && (
        <>
          <hr className="my-9 border-0 border-t border-dotted border-line" />

          <Panel>
            <PanelHeading>Top-scoring packages in each registry</PanelHeading>

            <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
              {topRows.map((row) => (
                <li key={`${row.registry}/${row.name}`}>
                  <Link
                    href={`/package/${row.registry}/${row.name}`}
                    className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3.5 py-3 text-ink"
                  >
                    <span className="truncate">
                      <span className="font-mono text-[13px] text-muted">{row.registry}</span>
                      <span className="mx-1.5 text-muted">/</span>
                      <span className="font-medium">{row.name}</span>
                    </span>
                    <span className="ml-3 shrink-0 tabular-nums text-[13px] text-muted">{row.score.toFixed(1)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </>
  );
}
