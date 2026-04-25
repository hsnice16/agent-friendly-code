import type { Metadata } from "next";
import Link from "next/link";

import { PackageLookupForm } from "@/components/PackageLookupForm";
import { Panel, PanelHeading } from "@/components/Panel";

export const metadata: Metadata = {
  title: "Packages",
  twitter: { title: "Packages" },
  alternates: { canonical: "/package" },
  openGraph: { title: "Packages", url: "/package" },
  description:
    "Look up any npm, PyPI, or Cargo package to see how agent-friendly its source repo is — the score, per-model breakdown, and an embeddable badge.",
};

const EXAMPLES = [
  { registry: "npm", name: "axios" },
  { registry: "npm", name: "react" },
  { registry: "cargo", name: "serde" },
  { registry: "pypi", name: "requests" },
] as const;

export default function PackageIndexPage() {
  return (
    <>
      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">Packages</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Developers pick dependencies in registry UIs, not on GitHub. Paste a package name and see how agent-friendly
          its source repo actually is.
        </p>
      </section>

      <Panel>
        <PanelHeading>Look up a package</PanelHeading>

        <PackageLookupForm />

        <p className="mt-3 text-[13.5px] text-muted">
          Prefer JSON? <code className="text-ink-dim">/api/package/&lt;registry&gt;/&lt;name&gt;</code>
        </p>
      </Panel>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Try it</PanelHeading>

          <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
            {EXAMPLES.map(({ registry, name }) => (
              <li key={`${registry}/${name}`}>
                <Link
                  href={`/package/${registry}/${name}`}
                  className="block rounded-lg border border-line bg-surface-2 px-3.5 py-3 text-ink hover:bg-surface-hover"
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
          <PanelHeading>What happens when it&apos;s not scored?</PanelHeading>
          <p className="m-0 max-w-[72ch] text-[14.5px] leading-relaxed text-ink-dim">
            If a package resolves to a source repo we don&apos;t track yet, the page shows you which repo it mapped to
            and links to a <strong className="text-ink mr-1">pre-filled GitHub issue</strong> you can submit to request
            scoring. If the registry manifest doesn&apos;t point at a parseable source URL at all, the issue template
            asks for the correct link.
          </p>
        </Panel>
      </div>
    </>
  );
}
