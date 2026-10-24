import { readdirSync } from "node:fs";
import { join } from "node:path";

import { entryKind, isFileEntry, resolveRelative } from "./helpers";
import type { Signal } from "./types";

const LABEL = "Skills (.agents/skills)";

// Presence only: the live-score path materializes the tree without skill
// contents, so judging a SKILL.md by what it says would score a clone differently.
export const agentSkills: Signal = {
  label: LABEL,
  id: "agent_skills",
  description: "Task-specific instructions in `.agents/skills/<name>/SKILL.md`, which agents load when a task matches.",
  improveSuggestion:
    "Add `.agents/skills/<name>/SKILL.md` for the workflows an agent repeats here (running one test, cutting a release, adding a migration), each with a `name` and `description` in its frontmatter.",
  check: (repo) => {
    const dir = resolveRelative(repo, ".agents/skills");

    if (dir && entryKind(repo, join(repo, dir)) === "dir") {
      let names: string[] = [];
      try {
        names = readdirSync(join(repo, dir)).sort();
      } catch {}

      const skills = names
        .map((n) => resolveRelative(repo, `${dir}/${n}/SKILL.md`))
        .filter((p): p is string => !!p && isFileEntry(repo, join(repo, p)));

      if (skills.length > 0) {
        return {
          pass: 1,
          label: LABEL,
          id: "agent_skills",
          matchedPath: skills[0],
          detail: `${skills.length} skill${skills.length === 1 ? "" : "s"} in ${dir}/`,
        };
      }
    }

    return {
      pass: 0,
      label: LABEL,
      id: "agent_skills",
      detail: "No .agents/skills/<name>/SKILL.md",
    };
  },
};
