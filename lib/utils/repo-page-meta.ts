import type { Metadata } from "next";

import { TYPED_LANGUAGE_DETAIL_PREFIX } from "@/lib/scoring/details";
import type { SignalResult } from "@/lib/scoring/signals";
import type { RepoRow } from "@/lib/types/db";
import { ogImage } from "@/lib/utils/og-image";
import type { RepoAboutData } from "@/lib/utils/repo-about";
import { repoDescription, repoTitle } from "@/lib/utils/repo-meta";
import { repoPath } from "@/lib/utils/repo-path";
import type { RepoSummary } from "@/lib/utils/repo-summary";
import { APP_URL, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

// type_config names the language of the build file it found, which can sit in a
// subfolder: react's compiler/Cargo.toml read as "Typed language (Rust)" for a
// JavaScript repo. Naming the file keeps the claim true.
export function propertyDescription(s: Pick<SignalResult, "detail" | "matchedPath">): string | undefined {
  if (!s.detail) return undefined;
  if (s.detail.startsWith(TYPED_LANGUAGE_DETAIL_PREFIX) && s.matchedPath?.includes("/")) {
    return `${s.detail}, from ${s.matchedPath}`;
  }
  return s.detail;
}

type PageFacts = { signals: SignalResult[]; summary: RepoSummary | null; about: RepoAboutData };

export function repoMetadata(repo: RepoRow, { signals, summary, about }: PageFacts): Metadata {
  const path = repoPath(repo);
  const slug = `${repo.owner}/${repo.name}`;
  const image = ogImage(path, `${slug} — agent-friendliness score`);

  // Absolute, so the root template's suffix can't push it past 60 characters.
  const title = repoTitle(slug, repo.overall_score, signals, repo.host);
  const description = repoDescription(slug, summary, repo.overall_score, signals, about.description);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, title, description, images: [image] },
    openGraph: { ...OG_DEFAULTS, title, description, url: path, type: "article", images: [image] },
  };
}

export function repoJsonLd(repo: RepoRow, { signals, summary, about }: PageFacts) {
  const slug = `${repo.owner}/${repo.name}`;
  const url = `${APP_URL}${repoPath(repo)}`;
  const keywords = new Set(
    [slug, repo.name, repo.owner, repo.language, ...about.topics, "AGENTS.md", "AI coding agent"].filter(
      (k): k is string => Boolean(k),
    ),
  );

  return {
    "@type": "SoftwareSourceCode",
    name: slug,
    codeRepository: repo.url,
    url,
    ...(repo.language ? { programmingLanguage: repo.language } : {}),
    ...(repo.content_changed_at != null
      ? { dateModified: new Date(repo.content_changed_at * 1000).toISOString() }
      : {}),
    keywords: [...keywords].join(", "),
    description: about.description ?? repoDescription(slug, summary, repo.overall_score, signals),
    additionalProperty: signals.map((s) => {
      const description = propertyDescription(s);
      return { "@type": "PropertyValue", name: s.label, value: s.pass, ...(description ? { description } : {}) };
    }),
  };
}
