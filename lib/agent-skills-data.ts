import { cache } from "react";

import { type AgentSkillsReport, buildAgentSkillsReport } from "./agent-skills-report";
import { ADOPTION } from "./agents-md-report";
import { listLeaderboardOverall, listSignalFiles } from "./db";
import { CENSUS } from "./file-census";

export const getAgentSkillsReport = cache(
  (): AgentSkillsReport =>
    buildAgentSkillsReport(CENSUS, listLeaderboardOverall(), listSignalFiles("agent_skills"), ADOPTION.points),
);
