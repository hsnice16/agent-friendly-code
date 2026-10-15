import { parseRepoUrl } from "./clients/github";
import { type Registry, resolvePackageToRepo } from "./clients/registries";
import { getModelScores, getPackageAlias, getRepoByHostOwnerName, putPackageAlias } from "./db";
import type { RepoRow } from "./types/db";
import { packageRequestIssueUrl } from "./utils/contact";

type PackageLookup =
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

// Each registry's own naming rule and length cap (npm 214, crates.io 64; PyPI
// sets none, so npm's). Anything else can't exist, so it costs no registry call.
const VALID_NAME: Record<Registry, RegExp> = {
  npm: /^(?=.{1,214}$)(?:@[a-z0-9~-][a-z0-9._~-]*\/)?[a-z0-9~-][a-z0-9._~-]*$/i,
  pypi: /^(?=.{1,214}$)[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/i,
  cargo: /^[a-z][a-z0-9_-]{0,63}$/i,
};

export function isValidPackageName(registry: Registry, pkg: string): boolean {
  return VALID_NAME[registry].test(pkg);
}

export async function lookupPackage(registry: Registry, pkg: string): Promise<PackageLookup> {
  if (!isValidPackageName(registry, pkg)) {
    return { registry, package: pkg, status: "unresolved", contact_url: packageRequestIssueUrl({ registry, pkg }) };
  }

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
  // by URL, which the registry's old name would miss. Not on Vercel: the DB is
  // a per-instance /tmp copy there, so the write is lost anyway, and it is the
  // one write an unauthenticated GET could trigger.
  if (isFresh && !process.env.VERCEL) {
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
