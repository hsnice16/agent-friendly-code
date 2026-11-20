import type { AgentFile, AgentInstructionsData } from "@/lib/utils/agent-instructions";
import { checkSubPath } from "@/lib/utils/check-path";
import { repoFileUrl } from "@/lib/utils/repo-file-url";

import { AgentInstructionsView } from "./AgentInstructionsView";
import { CompanionFiles } from "./CompanionFiles";

type RepoLocation = Parameters<typeof repoFileUrl>[0];

/** The agent-file checks read as one answer; "All checks" keeps the per-check detail. */
export function AgentInstructions({
  data,
  slug,
  repo,
  starter,
  companions = false,
}: {
  data: AgentInstructionsData;
  slug: string;
  repo: RepoLocation;
  /** A starter AGENTS.md, for a repo without a usable one. */
  starter?: string | null;
  /** Off on repo pages: crawlers read all of them, and the stubs are the same on each, so they link to one copy. */
  companions?: boolean;
}) {
  const link = (f: AgentFile) => ({ name: f.name, href: repoFileUrl(repo, f.path, f.directory), note: f.note });

  return (
    <AgentInstructionsView
      slug={slug}
      main={data.main ? { ...link(data.main), state: data.main.state } : null}
      absentMain={data.absentMain}
      others={data.others.map(link)}
      absentOthers={data.absentOthers}
      share={data.share}
      examplesHref={checkSubPath("agents_md", "examples")}
      starter={starter}
      companions={companions ? <CompanionFiles /> : null}
    />
  );
}
