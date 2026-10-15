import type { Metadata } from "next";

import { HOST_LABELS } from "@/lib/constants/hosts";
import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants/scoring";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import { leaderboardHref } from "@/lib/utils/leaderboard-href";
import { fitDescription, pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, DEFAULT_OG_IMAGE, OG_DEFAULTS, OG_IMAGE_SIZE, TWITTER_DEFAULTS } from "@/lib/version";

const HOME_TITLE = `${APP_NAME} — is your codebase ready for AI agents?`;

export function hostsText(host: LeaderboardView["host"]): string {
  return host === "all" ? "GitHub, GitLab and Bitbucket" : HOST_LABELS[host];
}

export function leaderboardTitle(view: LeaderboardView): string {
  const { page, totalPages, model } = view;
  if (model === "overall") {
    return page > 1 ? `Leaderboard page ${page} of ${totalPages} — ${APP_NAME}` : HOME_TITLE;
  }

  const { label } = MODEL_BY_ID[model];
  return pageTitle(
    page > 1 ? `${label} leaderboard page ${page} of ${totalPages}` : `Most ${label}-ready open source repos`,
  ).absolute;
}

export function leaderboardDescription(view: LeaderboardView): string {
  const { page, model, filtered, filteredRows } = view;
  const total = filteredRows.length;
  const hosts = hostsText(view.host);
  const agent = model === "overall" ? undefined : MODEL_BY_ID[model].label;
  const fit = agent ? `how easy they are for ${agent} to work in` : "how ready they are for AI coding agents";

  if (page > 1) {
    const first = (page - 1) * LEADERBOARD_PAGE_SIZE + 1;
    const last = Math.min(page * LEADERBOARD_PAGE_SIZE, total);
    return fitDescription(`${hosts} repos ranked ${first} to ${last} of ${total} by ${fit}.`);
  }

  if (!agent) {
    return fitDescription(
      `Public ${hosts} repos ranked by how ready they are for AI coding agents, with a score for each agent.`,
      "Or score your own codebase.",
    );
  }

  const top = filtered ? undefined : filteredRows[0];
  return fitDescription(
    `${total} public ${hosts} repos ranked by ${fit}.`,
    ...(top ? [`${top.owner}/${top.name} leads with ${(top.score ?? 0).toFixed(1)}.`] : []),
    `Scored on what ${agent} looks for.`,
  );
}

export function leaderboardMetadata(view: LeaderboardView): Metadata {
  // Every view points at itself. Canonicalising page 2+ back to the board
  // declared the deeper pages duplicates, which drained the repos only linked
  // from them. A filtered view is a re-cut of rows that already have a home, so
  // it takes `noindex, follow`: crawlable and link-passing, just not indexed. A
  // Disallow would instead hide that directive from the crawler that has to read it.
  const canonical = leaderboardHref(view);
  const title = leaderboardTitle(view);
  const description = leaderboardDescription(view);
  const image =
    view.model === "overall"
      ? DEFAULT_OG_IMAGE
      : { url: `/og/model/${view.model}`, ...OG_IMAGE_SIZE, alt: `Most ${MODEL_BY_ID[view.model].label}-ready repos` };

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    ...(view.filtered ? { robots: { index: false, follow: true } } : {}),
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: canonical, type: "website" },
  };
}
