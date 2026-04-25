export type RepoHost = "github" | "gitlab" | "bitbucket" | "unknown";

export type ParsedRepo = {
  name: string;
  owner: string;
  host: RepoHost;
  cloneUrl: string;
  canonicalUrl: string;
};

export function parseRepoUrl(input: string): ParsedRepo | null {
  const trimmed = input.trim().replace(/\.git$/, "");

  const patterns: Array<{ host: RepoHost; re: RegExp; base: string }> = [
    {
      host: "github",
      base: "https://github.com",
      re: /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s?#]+)/i,
    },
    {
      host: "gitlab",
      base: "https://gitlab.com",
      re: /^(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([^/\s]+(?:\/[^/\s?#]+)*?)\/([^/\s?#]+)(?:\/-\/.*)?$/i,
    },
    {
      host: "bitbucket",
      base: "https://bitbucket.org",
      re: /^(?:https?:\/\/)?(?:www\.)?bitbucket\.org\/([^/\s]+)\/([^/\s?#]+)/i,
    },
  ];

  for (const p of patterns) {
    const m = trimmed.match(p.re);

    if (m) {
      const name = m[2];
      const owner = m[1];

      return {
        name,
        owner,
        host: p.host,
        cloneUrl: `${p.base}/${owner}/${name}.git`,
        canonicalUrl: `${p.base}/${owner}/${name}`,
      };
    }
  }
  return null;
}

export async function fetchRepoMeta(parsed: ParsedRepo): Promise<{
  stars?: number;
  defaultBranch?: string;
  language?: string | null;
} | null> {
  try {
    if (parsed.host === "github") {
      const headers: Record<string, string> = {
        "User-Agent": "agent-friendly-code",
        Accept: "application/vnd.github+json",
      };

      if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.name}`, { headers });

      if (!res.ok) {
        return null;
      }

      const j: any = await res.json();
      return {
        stars: j.stargazers_count,
        language: j.language ?? null,
        defaultBranch: j.default_branch,
      };
    }

    if (parsed.host === "gitlab") {
      const slug = encodeURIComponent(`${parsed.owner}/${parsed.name}`);
      const headers: Record<string, string> = {
        "User-Agent": "agent-friendly-code",
      };

      if (process.env.GITLAB_TOKEN) {
        headers["PRIVATE-TOKEN"] = process.env.GITLAB_TOKEN;
      }

      const res = await fetch(`https://gitlab.com/api/v4/projects/${slug}`, {
        headers,
      });

      if (!res.ok) {
        return null;
      }

      const j: any = await res.json();
      // GitLab's primary-language requires a separate /languages call; skip for v1.
      return {
        language: null,
        stars: j.star_count,
        defaultBranch: j.default_branch,
      };
    }

    if (parsed.host === "bitbucket") {
      const res = await fetch(`https://api.bitbucket.org/2.0/repositories/${parsed.owner}/${parsed.name}`, {
        headers: { "User-Agent": "agent-friendly-code" },
      });

      if (!res.ok) {
        return null;
      }

      const j: any = await res.json();
      return {
        language: j.language ?? null,
        defaultBranch: j.mainbranch?.name,
      };
    }
  } catch {}
  return null;
}
