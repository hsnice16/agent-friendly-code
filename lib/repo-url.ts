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
