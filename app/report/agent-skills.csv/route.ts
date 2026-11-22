import { getAgentSkillsReport } from "@/lib/agent-skills-data";
import { agentSkillsCsv } from "@/lib/agent-skills-report";
import { BOARD_CACHE_CONTROL } from "@/lib/constants/cache";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(agentSkillsCsv(getAgentSkillsReport().rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="agent-skills.csv"',
      "Cache-Control": BOARD_CACHE_CONTROL,
    },
  });
}
