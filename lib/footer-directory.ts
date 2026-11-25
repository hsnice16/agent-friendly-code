import { guideBySlug } from "@/lib/guides";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { TOPICS_PATH } from "@/lib/topics";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { COMPARE_PATH } from "@/lib/utils/compare-path";
import { CONTRIBUTE_PATH } from "@/lib/utils/contribute-path";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";
import { GUIDE_PATH, guidePath } from "@/lib/utils/guide-path";
import { modelPath } from "@/lib/utils/leaderboard-href";
import {
  AI_POLICY_REPORT_PATH,
  CONTENTS_REPORT_PATH,
  REPORT_PATH,
  REPORT_TITLE,
  SIZE_REPORT_PATH,
  SKILLS_REPORT_PATH,
} from "@/lib/utils/report-path";

type Item = { label: string; href: string };
export type DirectoryRow = { label: string; items: Item[]; all: Item };

// The guides with the most search demand; the rest, and every framework and
// language examples page, are one click away on /guide and the examples hub.
const FOOTER_GUIDES = ["claude-md", "copilot-instructions", "agents-md-vs-skills", "agents-md-monorepo"];

// Languages and topics get only their hub: the footer is in every page's HTML,
// and the hubs, the sitemap and each repo page's own chips already link every one of them.
export function footerDirectoryRows(): DirectoryRow[] {
  return [
    {
      label: "Agents",
      items: MODELS.map((m) => ({ label: m.label, href: modelPath(m.id) })),
      all: { label: "Files each reads →", href: "/agents" },
    },
    {
      label: "Languages",
      items: [],
      all: { label: "All languages →", href: "/language" },
    },
    {
      label: "Checks",
      items: SIGNALS.map((s) => ({ label: s.label, href: checkPath(s.id) })),
      all: { label: "Agent-ready checklist →", href: "/check" },
    },
    {
      label: "Guides",
      items: [
        { label: "AGENTS.md examples", href: checkSubPath("agents_md", "examples") },
        { label: "AGENTS.md vs CLAUDE.md", href: checkSubPath("agents_md", "vs-claude-md") },
        ...FOOTER_GUIDES.flatMap((slug) => {
          const g = guideBySlug(slug);
          return g ? [{ label: g.name, href: guidePath(slug) }] : [];
        }),
        { label: "AGENTS.md generator", href: GENERATOR_PATH },
        { label: "Compare agents", href: COMPARE_PATH },
        { label: "Projects to contribute to", href: CONTRIBUTE_PATH },
        { label: REPORT_TITLE, href: REPORT_PATH },
        { label: "AGENTS.md sizes", href: SIZE_REPORT_PATH },
        { label: "What's in an AGENTS.md", href: CONTENTS_REPORT_PATH },
        { label: "Agent skills in repos", href: SKILLS_REPORT_PATH },
        { label: "AI contribution policies", href: AI_POLICY_REPORT_PATH },
      ],
      all: { label: "Make your repo agent-ready →", href: GUIDE_PATH },
    },
    {
      label: "Topics",
      items: [],
      all: { label: "All topics →", href: TOPICS_PATH },
    },
  ];
}
