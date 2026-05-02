import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { HostPill } from "@/components/HostPill";
import { Panel, PanelHeading } from "@/components/Panel";
import { ScoreNumber } from "@/components/ScoreNumber";
import { isRegistry, type Registry } from "@/lib/clients/registries";
import { lookupPackage } from "@/lib/package-lookup";
import { APP_URL } from "@/lib/version";

const cachedLookup = cache((registry: Registry, name: string) => lookupPackage(registry, name));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ registry: string; name: string }>;
}): Promise<Metadata> {
  const { registry, name } = await params;
  const title = `${registry}/${name}`;
  const description = `Agent-friendliness score for the ${registry} package "${name}" and its source repo.`;

  if (!isRegistry(registry)) {
    return { title, description, robots: { index: false, follow: true } };
  }

  const result = await cachedLookup(registry, name);
  const isThin = result.status !== "scored";

  return {
    title,
    description,
    twitter: { title, description },
    alternates: { canonical: `/package/${registry}/${name}` },
    openGraph: { title, description, url: `/package/${registry}/${name}`, type: "article" },
    ...(isThin ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Page({ params }: { params: Promise<{ registry: string; name: string }> }) {
  const { registry, name } = await params;

  if (!isRegistry(registry)) {
    notFound();
  }

  const result = await cachedLookup(registry, name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Packages",
        item: `${APP_URL}/package`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${registry}/${name}`,
        item: `${APP_URL}/package/${registry}/${name}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content; payload is server-controlled and `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link
        href="/package"
        className="my-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← all packages
      </Link>

      <Panel>
        <PanelHeading>
          <span className="text-muted">Package</span>
        </PanelHeading>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-[13px] text-muted">{registry}</span>
          <span className="text-muted">/</span>
          <h1 className="m-0 break-all text-[22px] font-semibold tracking-tight">{name}</h1>
        </div>
      </Panel>

      {result.status === "scored" && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Score</PanelHeading>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 break-all text-[16px] font-semibold">
                  {result.repo.owner}/{result.repo.name}
                  <HostPill host={result.repo.host} />
                </div>

                <Link
                  href={`/repo/${result.repo.id}`}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-ink-dim hover:text-ink-soft"
                >
                  Full score breakdown <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </Link>
              </div>

              <ScoreNumber score={result.repo.overall_score ?? 0} size="xl" />
            </div>
          </Panel>
        </div>
      )}

      {result.status === "not_scored" && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Not scored yet</PanelHeading>

            <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
              This package maps to{" "}
              <strong className="break-all text-ink">
                {result.repo.host}/{result.repo.owner}/{result.repo.name}
              </strong>
              , but we haven&apos;t scored it yet.
            </p>

            <a
              target="_blank"
              href={result.contact_url}
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-hover"
            >
              Request scoring <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
            </a>
          </Panel>
        </div>
      )}

      {result.status === "unresolved" && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Couldn&apos;t find the source repo</PanelHeading>

            <p className="m-0 text-[14.5px] leading-relaxed text-ink-dim">
              The <span className="mr-1">{registry}</span> registry either doesn&apos;t list a source repo for this
              package, or it lists one we can&apos;t parse (monorepo subdirectory, self-hosted host, etc.).
            </p>

            <a
              target="_blank"
              href={result.contact_url}
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-surface-hover"
            >
              Tell us the correct URL <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
            </a>
          </Panel>
        </div>
      )}
    </>
  );
}
