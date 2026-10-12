import { AGENT_FILE_CHECKS } from "./agent-files";
import { REPO_BASIC_CHECKS } from "./repo-basics";
import type { CheckContent } from "./types";

export type { CheckContent };

export const CHECK_CONTENT: Record<string, CheckContent> = { ...AGENT_FILE_CHECKS, ...REPO_BASIC_CHECKS };
