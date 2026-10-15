import { cache } from "react";

import { listLeaderboardOverall, listSignalFiles } from "./db";
import { relatedTopics, type TopicGroup, topicGroups } from "./topics";
import type { LeaderboardRow } from "./types/db";
import { hasAgentFile } from "./utils/agent-instructions";
import { averageScore } from "./utils/language";

export type TopicPage = TopicGroup<LeaderboardRow> & {
  average: number;
  boardAverage: number;
  withAgentFile: number;
  top: LeaderboardRow;
  related: TopicGroup<LeaderboardRow>[];
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
    top: group.rows[0],
    related: relatedTopics(group, groups),
  };
});
