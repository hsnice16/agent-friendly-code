import { notFound } from "next/navigation";

import { getAgentSkillsReport } from "@/lib/agent-skills-data";
import { agentSkillsDescription, agentSkillsTitle } from "@/lib/agent-skills-report";
import { ADOPTION } from "@/lib/agents-md-report";
import { buildAgentsMdSize, sizeDescription, sizeTitle } from "@/lib/agents-md-size";
import { aiPolicyDescription, aiPolicyTitle } from "@/lib/ai-policy";
import { listLeaderboardOverall } from "@/lib/db";
import { getAgentsMdExamples } from "@/lib/leaderboard-files";
import { pageCard } from "@/lib/og-card";
import { formatDay, percent } from "@/lib/utils/format";
import {
  AI_POLICY_REPORT_PATH,
  REPORT_PATH,
  REPORT_TITLE,
  SIZE_REPORT_PATH,
  SKILLS_REPORT_PATH,
} from "@/lib/utils/report-path";

// Prerendered: rendering a card on request costs function CPU on every crawler fetch.
export const dynamic = "force-static";
export const dynamicParams = false;

const CARDS: Record<string, () => { title: string; sub: string; path: string }> = {
  [REPORT_PATH]: () => {
    const last = ADOPTION.points[ADOPTION.points.length - 1];
    return {
      title: REPORT_TITLE,
      sub: `${percent(last.agentsMd, last.repos)} of ${last.repos} popular open source repos have an AGENTS.md, as of ${formatDay(last.date)}.`,
      path: REPORT_PATH,
    };
  },
  [SIZE_REPORT_PATH]: () => {
    const size = buildAgentsMdSize(getAgentsMdExamples().rows, listLeaderboardOverall());
    return { title: sizeTitle(size.measured), sub: sizeDescription(size), path: SIZE_REPORT_PATH };
  },
  [AI_POLICY_REPORT_PATH]: () => ({ title: aiPolicyTitle(), sub: aiPolicyDescription(), path: AI_POLICY_REPORT_PATH }),
  [SKILLS_REPORT_PATH]: () => {
    const r = getAgentSkillsReport();
    return { title: agentSkillsTitle(r), sub: agentSkillsDescription(r), path: SKILLS_REPORT_PATH };
  },
};

const slugOf = (path: string) => path.slice("/report/".length);

export function generateStaticParams() {
  return Object.keys(CARDS).map((path) => ({ slug: slugOf(path) }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const card = CARDS[`/report/${(await params).slug}`];
  if (!card) notFound();
  return pageCard(card());
}
