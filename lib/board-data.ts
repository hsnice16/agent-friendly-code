import { type BoardData, type BoardRow, defaultRepoUrl } from "@/lib/board";
import { listLeaderboard } from "@/lib/db";
import { MODELS, type ModelId } from "@/lib/scoring/weights";
import type { LeaderboardRow } from "@/lib/types/db";
import { sanitizeDescription } from "@/lib/utils/repo-about";

export function toBoardRow(r: LeaderboardRow): BoardRow {
  return {
    id: r.id,
    host: r.host,
    owner: r.owner,
    name: r.name,
    url: r.url,
    stars: r.stars,
    badge_embedded: r.badge_embedded ? 1 : 0,
    // LeaderboardTable sanitises what it shows.
    description: r.description ?? null,
    score: r.score,
  };
}

/** Every board in one payload, for the browser to search, filter and sort. */
export function buildBoardData(): BoardData {
  const models: (ModelId | "overall")[] = ["overall", ...MODELS.map((m) => m.id)];
  const repos = new Map<number, BoardData["repos"][number]>();

  models.forEach((model, i) => {
    for (const r of listLeaderboard({ model })) {
      let repo = repos.get(r.id);
      if (!repo) {
        const description = sanitizeDescription(r.description);
        repo = {
          id: r.id,
          h: r.host,
          o: r.owner,
          n: r.name,
          s: r.stars,
          ...(r.badge_embedded ? { b: 1 as const } : {}),
          ...(description ? { d: description } : {}),
          ...(r.url === defaultRepoUrl(r) ? {} : { u: r.url }),
          sc: models.map(() => null),
        };
        repos.set(r.id, repo);
      }
      repo.sc[i] = r.score;
    }
  });

  return { models, repos: [...repos.values()] };
}
