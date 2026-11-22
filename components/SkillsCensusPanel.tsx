import type { AgentSkillsReport } from "@/lib/agent-skills-report";
import { formatDay } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { SkillsCensusView } from "./SkillsCensusView";

export function SkillsCensusPanel({ report: r, limit }: { report: AgentSkillsReport; limit: number }) {
  const top = [...r.rows].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0)).slice(0, limit);
  const elsewhere = r.elsewhereOnly.length;

  return (
    <SkillsCensusView
      summary={`On ${formatDay(r.date)}, ${r.rows.length} of the ${r.repos} GitHub repos whose whole tree we read shipped a SKILL.md in \`.agents/skills/\` or \`.claude/skills/\`: ${r.agents} in \`.agents/skills/\`, ${r.claude} in \`.claude/skills/\`.${elsewhere > 0 ? ` ${elsewhere} more keep them only elsewhere, often skills a project publishes for its users.` : ""} The check counts only a root \`.agents/skills/\`.`}
      rows={top.map((s) => ({
        repo: `${s.owner}/${s.name}`,
        href: s.board ? repoPath(s.board) : null,
        agents: s.agents > 0 ? { count: s.agents, href: s.agentsDirUrl } : null,
        claude: s.claude > 0 ? { count: s.claude, href: null } : null,
        other: s.other,
      }))}
    />
  );
}
