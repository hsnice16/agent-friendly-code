import type { ExampleRow } from "@/lib/agents-md-examples";

import { AgentsMdExampleTableView, type Props } from "./AgentsMdExampleTableView";

/** Rows are cut to the columns shown: a client view's props are its payload (AGENTS.md → Conventions). */
export function AgentsMdExampleTable({ rows, ...rest }: Omit<Props, "rows"> & { rows: ExampleRow[] }) {
  const slim = rows.map((r) => ({
    id: r.id,
    host: r.host,
    owner: r.owner,
    name: r.name,
    file: r.file,
    fileUrl: r.fileUrl,
    length: r.length,
    stars: r.stars,
    language: r.language,
    score: r.score,
  }));

  return <AgentsMdExampleTableView rows={slim} {...rest} />;
}
