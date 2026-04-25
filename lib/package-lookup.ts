import { parseRepoUrl } from "./clients/github";
import { type Registry, resolvePackageToRepo } from "./clients/registries";
import { getModelScores, getPackageAlias, getRepoByUrl, putPackageAlias, type RepoRow } from "./db";
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

  if (!parsed) {
    parsed = await resolvePackageToRepo(registry, pkg);

    if (parsed) {
      putPackageAlias(registry, pkg, parsed.canonicalUrl);
    }
  }

  if (!parsed) {
    return {
      registry,
      package: pkg,
      status: "unresolved",
      contact_url: packageRequestIssueUrl({ registry, pkg }),
    };
  }

  const repo = getRepoByUrl(parsed.canonicalUrl);

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
