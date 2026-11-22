import { cache } from "react";

import { listLeaderboardOverall, listSignalFiles } from "./db";
import { commonGaps } from "./language-hubs";
import { boardLeader } from "./leaderboard-meta";
import { relatedTopics, type TopicGroup, topicGroups } from "./topics";
import type { LeaderboardRow, SignalPassRate } from "./types/db";
import { hasAgentFile } from "./utils/agent-instructions";
import { averageScore } from "./utils/language";

export type TopicPage = TopicGroup<LeaderboardRow> & {
  average: number;
  boardAverage: number;
  withAgentFile: number;
  /** Undefined when no repo here clears the star floor. */
  top: LeaderboardRow | undefined;
  related: TopicGroup<LeaderboardRow>[];
  gaps: SignalPassRate[];
};

export const getTopicGroups = cache(() => topicGroups(listLeaderboardOverall()));

export const getTopicPage = cache((slug: string): TopicPage | null => {
  const groups = getTopicGroups();
  const group = groups.find((g) => g.slug === slug);
  if (!group) return null;

  const ids = new Set(group.rows.map((r) => r.id));
  const withAgentFile = listSignalFiles("agents_md").filter((f) => ids.has(f.repoId) && hasAgentFile(f)).length;
  return {
    ...group,
    average: averageScore(group.rows),
    boardAverage: averageScore(listLeaderboardOverall()),
    withAgentFile,
    top: boardLeader(group.rows),
    related: relatedTopics(group, groups),
    gaps: commonGaps([...ids]),
  };
});
