import {
  type AiPolicy,
  groupByStance,
  repoKey,
  STANCE_LABEL,
  STANCE_MEANING,
  type Stance,
  stanceAnchor,
} from "@/lib/ai-policy";

import { AiPolicyTableView } from "./AiPolicyTableView";
import { STANCE_CHIP } from "./stance-chip";

export function StanceChip({ stance }: { stance: Stance }) {
  return <span className={`chip eyebrow whitespace-nowrap ${STANCE_CHIP[stance]}`}>{STANCE_LABEL[stance]}</span>;
}

/** Grouped rather than filtered, so every stance has an anchor the breakdown links to. */
export function AiPolicyTable({ policies, onBoard }: { policies: AiPolicy[]; onBoard: Set<string> }) {
  const groups = groupByStance(policies).map((g) => ({
    stance: g.stance,
    label: STANCE_LABEL[g.stance],
    meaning: STANCE_MEANING[g.stance],
    anchor: stanceAnchor(g.stance),
    rows: g.policies.map((p) => ({
      key: repoKey(p),
      host: p.host,
      owner: p.owner,
      name: p.name,
      onBoard: onBoard.has(repoKey(p)),
      summary: p.summary,
      url: p.url,
      path: p.path,
    })),
  }));

  return <AiPolicyTableView groups={groups} />;
}
