import type { Registry } from "../clients/registries";
import { REPO_URL } from "../version";

type Params = {
  pkg: string;
  registry: Registry;
  resolvedRepo?: { host: string; owner: string; name: string } | null;
};

export function packageRequestIssueUrl({ pkg, registry, resolvedRepo }: Params): string {
  const title = resolvedRepo
    ? `Score request: ${registry}/${pkg} (${resolvedRepo.host}/${resolvedRepo.owner}/${resolvedRepo.name})`
    : `Score request: ${registry}/${pkg}`;

  const bodyLines = resolvedRepo
    ? [
        `The package \`${registry}:${pkg}\` resolves to \`${resolvedRepo.host}/${resolvedRepo.owner}/${resolvedRepo.name}\`, but it isn't scored yet.`,
        "",
        "Please score it so it shows up at:",
        `- ${registry}/${pkg} lookup`,
        `- repo page for \`${resolvedRepo.owner}/${resolvedRepo.name}\``,
      ]
    : [
        `The package \`${registry}:${pkg}\` couldn't be resolved to a source repo — the registry manifest didn't have a usable repository URL, or it pointed somewhere we can't parse.`,
        "",
        "If you know the source repo, paste the URL here so we can add it:",
        "",
        "`<paste source repo URL here>`",
      ];

  const body = bodyLines.join("\n");
  const qs = new URLSearchParams({ title, body, labels: "score-request" });

  return `${REPO_URL}/issues/new?${qs.toString()}`;
}
