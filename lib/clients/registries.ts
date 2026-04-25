import { type ParsedRepo, parseRepoUrl } from "./github";

export type Registry = "npm" | "pypi" | "cargo";
export const REGISTRIES: Registry[] = ["npm", "pypi", "cargo"];

export function isRegistry(v: string | undefined): v is Registry {
  return !!v && (REGISTRIES as string[]).includes(v);
}

function normalizeToRepoUrl(raw: string | null | undefined): ParsedRepo | null {
  if (!raw) {
    return null;
  }

  const cleaned = raw
    .trim()
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/^ssh:\/\/git@/, "https://")
    .replace(/\.git$/, "");

  return parseRepoUrl(cleaned);
}

export async function resolvePackageToRepo(registry: Registry, name: string): Promise<ParsedRepo | null> {
  try {
    if (registry === "npm") {
      const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
        headers: { "User-Agent": "agent-friendly-code" },
      });

      if (!res.ok) {
        return null;
      }

      const j: any = await res.json();
      const url = typeof j.repository === "string" ? j.repository : j.repository?.url;

      return normalizeToRepoUrl(url);
    }

    if (registry === "pypi") {
      const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`, {
        headers: { "User-Agent": "agent-friendly-code" },
      });

      if (!res.ok) {
        return null;
      }

      const j: any = await res.json();
      const urls = j.info?.project_urls ?? {};
      const candidate = urls.Source ?? urls.Repository ?? urls.Homepage ?? j.info?.home_page;

      return normalizeToRepoUrl(candidate);
    }

    if (registry === "cargo") {
      const res = await fetch(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`, {
        headers: { "User-Agent": "agent-friendly-code" },
      });

      if (!res.ok) {
        return null;
      }

      const j: any = await res.json();
      return normalizeToRepoUrl(j.crate?.repository);
    }
  } catch {}

  return null;
}
