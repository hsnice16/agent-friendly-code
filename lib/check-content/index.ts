import { AGENT_FILE_CHECKS } from "./agent-files";
import { CHECK_QUESTIONS } from "./questions";
import { REPO_BASIC_CHECKS } from "./repo-basics";
import type { CheckContent, CheckQuestions } from "./types";

export type { CheckContent, CheckQuestions };
export { CHECK_QUESTIONS };

export const CHECK_CONTENT: Record<string, CheckContent> = { ...AGENT_FILE_CHECKS, ...REPO_BASIC_CHECKS };
