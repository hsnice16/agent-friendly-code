import { type ParsedRepo, parseRepoUrl } from "../repo-url";
import { obj, str } from "../utils/json";

export type Registry = "npm" | "pypi" | "cargo";
export const REGISTRIES: Registry[] = ["npm", "pypi", "cargo"];

// An unauthenticated GET waits on this call, so it must not hang the request.
const REGISTRY_TIMEOUT_MS = 10_000;

// PyPI's project_urls keys are free text. These name the repo most often;
// any other link that parses as a repo is the fallback.
const PYPI_REPO_KEYS = ["source", "source code", "repository", "code", "github", "homepage"];

export function isRegistry(v: string | undefined): v is Registry {
  return !!v && (REGISTRIES as string[]).includes(v);
}

export function normalizeToRepoUrl(raw: unknown): ParsedRepo | null {
  if (typeof raw !== "string") {
    return null;
  }

  const cleaned = raw
    .trim()
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^ssh:\/\/git@/, "https://")
    .replace(/^git@([^:/]+):/, "https://$1/");

  return parseRepoUrl(cleaned);
}

function pypiRepo(info: Record<string, unknown>): ParsedRepo | null {
  const urls = Object.entries(obj(info.project_urls)).map(([k, v]) => [k.toLowerCase(), v] as const);
  const named = PYPI_REPO_KEYS.flatMap((key) => urls.filter(([k]) => k === key).map(([, v]) => v));
  for (const candidate of [...named, ...urls.map(([, v]) => v), info.home_page]) {
    const parsed = normalizeToRepoUrl(candidate);
    if (parsed) return parsed;
  }
  return null;
}

async function getJson(url: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": "agent-friendly-code" },
    signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS),
  });
  return res.ok ? obj(await res.json()) : null;
}

export async function resolvePackageToRepo(registry: Registry, name: string): Promise<ParsedRepo | null> {
  try {
    const pkg = encodeURIComponent(name);

    if (registry === "npm") {
      // The latest version's manifest: the full document carries every version and can run to megabytes.
      const j = await getJson(`https://registry.npmjs.org/${pkg}/latest`);
      return j && normalizeToRepoUrl(str(j.repository) ?? obj(j.repository).url);
    }

    if (registry === "pypi") {
      const j = await getJson(`https://pypi.org/pypi/${pkg}/json`);
      return j && pypiRepo(obj(j.info));
    }

    if (registry === "cargo") {
      const j = await getJson(`https://crates.io/api/v1/crates/${pkg}`);
      return j && normalizeToRepoUrl(obj(j.crate).repository);
    }
  } catch {}

  return null;
}
