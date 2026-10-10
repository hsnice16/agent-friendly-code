import { parseRepoUrl } from "./clients/github";
import { type Registry, resolvePackageToRepo } from "./clients/registries";
import { getModelScores, getPackageAlias, getRepoByHostOwnerName, putPackageAlias } from "./db";
import type { RepoRow } from "./types/db";
import { packageRequestIssueUrl } from "./utils/contact";

export type PackageLookup =
  | {
      repo: RepoRow;
      package: string;
      status: "scored";
      registry: Registry;
      per_model: Array<{ modelId: string; score: number }>;
    }
  | {
      package: string;
      registry: Registry;
      contact_url: string;
      status: "not_scored";
      repo: { host: string; owner: string; name: string };
    }
  | {
      package: string;
      registry: Registry;
      contact_url: string;
      status: "unresolved";
    };

export async function lookupPackage(registry: Registry, pkg: string): Promise<PackageLookup> {
  const cachedUrl = getPackageAlias(registry, pkg);
  let parsed = cachedUrl ? parseRepoUrl(cachedUrl) : null;

  const isFresh = !parsed;
  if (!parsed) {
    parsed = await resolvePackageToRepo(registry, pkg);
  }

  if (!parsed) {
    return {
      registry,
      package: pkg,
      status: "unresolved",
      contact_url: packageRequestIssueUrl({ registry, pkg }),
    };
  }

  // By name, not URL: registries keep pointing at a renamed repo's old name.
  const repo = getRepoByHostOwnerName(parsed.host, parsed.owner, parsed.name);

  // The stored repo's URL when there is one: the sitemap joins aliases to repos
  // by URL, which the registry's old name would miss.
  if (isFresh) {
    putPackageAlias(registry, pkg, repo?.url ?? parsed.canonicalUrl);
  }

  if (!repo) {
    return {
      registry,
      package: pkg,
      status: "not_scored",
      repo: { host: parsed.host, owner: parsed.owner, name: parsed.name },
      contact_url: packageRequestIssueUrl({
        pkg,
        registry,
        resolvedRepo: {
          host: parsed.host,
          name: parsed.name,
          owner: parsed.owner,
        },
      }),
    };
  }

  return {
    repo,
    registry,
    package: pkg,
    status: "scored",
    per_model: getModelScores(repo.id),
  };
}
