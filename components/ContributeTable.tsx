import { type ContributeRow, hasPolicies } from "@/lib/contribute";

import { ContributeTableView, type Props } from "./ContributeTableView";

/** Rows are cut to the table's columns before they cross to the client view: every prop ships in the payload. */
export function ContributeTable({ rows, ...rest }: Omit<Props, "rows" | "policy"> & { rows: ContributeRow[] }) {
  const slim = rows.map((r) => ({
    id: r.id,
    host: r.host,
    owner: r.owner,
    name: r.name,
    language: r.language,
    stars: r.stars,
    score: r.score,
    agentFile: r.agentFile,
    devSetup: r.devSetup,
    preCommit: r.preCommit,
    policy: r.policy,
  }));

  return <ContributeTableView rows={slim} policy={hasPolicies(rows)} {...rest} />;
}
