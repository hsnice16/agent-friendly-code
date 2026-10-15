import { num, obj, str } from "../utils/json";
import { sanitizeDescription, sanitizeTopics } from "../utils/repo-about";
import { canonicalLanguage, primaryLanguage } from "./language";

export type RepoHost = "github" | "gitlab" | "bitbucket" | "unknown";

export type ParsedRepo = {
  name: string;
  owner: string;
  host: RepoHost;
  cloneUrl: string;
  canonicalUrl: string;
};

// Every host limits a path segment to [\w.-]. Anything else, or a "." / ".."
// segment, would change the API and raw-file paths built from the parts.
const PATTERNS: Array<{ host: RepoHost; re: RegExp; base: string }> = [
  {
    host: "github",
    base: "https://github.com",
    re: /^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)(?:[/?#].*)?$/i,
  },
  {
    // Only "/-/" ends a GitLab project path: /a/b/c is project c in group a/b.
    host: "gitlab",
    base: "https://gitlab.com",
    re: /^(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([\w.-]+(?:\/[\w.-]+)*?)\/([\w.-]+)(?:\/-\/.*|\/)?(?:[?#].*)?$/i,
  },
  {
    host: "bitbucket",
    base: "https://bitbucket.org",
    re: /^(?:https?:\/\/)?(?:www\.)?bitbucket\.org\/([\w.-]+)\/([\w.-]+)(?:[/?#].*)?$/i,
  },
];

const isDots = (segment: string) => /^\.+$/.test(segment);

export function parseRepoUrl(input: string): ParsedRepo | null {
  const trimmed = input.trim();

  for (const p of PATTERNS) {
    const m = trimmed.match(p.re);
    if (!m) continue;

    const owner = m[1];
    const name = m[2].replace(/\.git$/i, "");
    if (!name || isDots(name) || owner.split("/").some(isDots)) return null;

    return {
      name,
      owner,
      host: p.host,
      cloneUrl: `${p.base}/${owner}/${name}.git`,
      canonicalUrl: `${p.base}/${owner}/${name}`,
    };
  }
  return null;
}

// A failed languages call costs only the language: the stored one survives,
// because saveScoredRepo keeps the old value when the new one is null.
async function fetchGitLabLanguage(
  slug: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const res = await fetch(`https://gitlab.com/api/v4/projects/${slug}/languages`, { headers, signal });
    return res.ok ? primaryLanguage(obj(await res.json()) as Record<string, number>) : null;
  } catch {
    return null;
  }
}

type RepoMeta = {
  stars?: number;
  defaultBranch?: string;
  language?: string | null;
  description: string | null;
  topics: string[];
};

const META_TIMEOUT_MS = 15_000;

const repoSegment = (p: ParsedRepo) => `${encodeURIComponent(p.owner)}/${encodeURIComponent(p.name)}`;

// Metadata only: a private repo reads as unknown. To refuse private repos, use
// fetchRepoMetaOrPrivate.
export async function fetchRepoMeta(parsed: ParsedRepo): Promise<RepoMeta | null> {
  const meta = await fetchRepoMetaOrPrivate(parsed);
  return meta === "private" ? null : meta;
}

// "private" is distinct from null (unknown) so the live path can refuse to
// score without mistaking a failed metadata call for a missing repo.
export async function fetchRepoMetaOrPrivate(parsed: ParsedRepo): Promise<RepoMeta | "private" | null> {
  const signal = AbortSignal.timeout(META_TIMEOUT_MS);
  try {
    if (parsed.host === "github") {
      const headers: Record<string, string> = {
        "User-Agent": "agent-friendly-code",
        Accept: "application/vnd.github+json",
      };

      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const res = await fetch(`https://api.github.com/repos/${repoSegment(parsed)}`, { headers, signal });

      if (!res.ok) {
        return null;
      }

      const j = obj(await res.json());
      if (j.private === true || (j.visibility && j.visibility !== "public")) return "private";
      return {
        stars: num(j.stargazers_count),
        language: canonicalLanguage(str(j.language)),
        defaultBranch: str(j.default_branch),
        description: sanitizeDescription(j.description),
        topics: sanitizeTopics(j.topics),
      };
    }

    if (parsed.host === "gitlab") {
      const slug = encodeURIComponent(`${parsed.owner}/${parsed.name}`);
      const headers: Record<string, string> = {
        "User-Agent": "agent-friendly-code",
      };

      if (process.env.GITLAB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITLAB_TOKEN}`;
      }

      const res = await fetch(`https://gitlab.com/api/v4/projects/${slug}`, { headers, signal });

      if (!res.ok) {
        return null;
      }

      const j = obj(await res.json());
      // "internal" is visible to any signed-in user, which a token is.
      if (j.visibility && j.visibility !== "public") return "private";
      return {
        language: await fetchGitLabLanguage(slug, headers, signal),
        stars: num(j.star_count),
        defaultBranch: str(j.default_branch),
        description: sanitizeDescription(j.description),
        // tag_list is the pre-14.5 name for topics.
        topics: sanitizeTopics(j.topics ?? j.tag_list),
      };
    }

    if (parsed.host === "bitbucket") {
      const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${repoSegment(parsed)}`, {
        headers: { "User-Agent": "agent-friendly-code" },
        signal,
      });

      if (!res.ok) {
        return null;
      }

      const j = obj(await res.json());
      if (j.is_private === true) return "private";
      return {
        language: canonicalLanguage(str(j.language)),
        defaultBranch: str(obj(j.mainbranch).name),
        description: sanitizeDescription(j.description),
        topics: [],
      };
    }
  } catch {}
  return null;
}
