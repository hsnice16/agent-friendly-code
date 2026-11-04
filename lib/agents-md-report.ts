import raw from "@/data/agents-md-adoption.json";

import { type AdoptionSeries, parseAdoption, SERIES_LABEL } from "./agents-md-adoption";
import { OTHER_FILES } from "./utils/agent-instructions";
import { REPORT_CSV_PATH, REPORT_PATH, REPORT_TITLE } from "./utils/report-path";
import { APP_NAME, APP_URL } from "./version";

export const ADOPTION = parseAdoption(raw);

/** Same shape as the home page's Dataset, which this is a slice of over time. */
export function adoptionDatasetJsonLd(series: AdoptionSeries = ADOPTION): Record<string, unknown> {
  const first = series.points[0];
  const last = series.points[series.points.length - 1];
  return {
    "@type": "Dataset",
    "@id": `${APP_URL}${REPORT_PATH}#dataset`,
    name: `${REPORT_TITLE} — share of open source repos with agent instruction files over time`,
    description: `How many of the repos on the ${APP_NAME} leaderboard have a non-empty AGENTS.md, CLAUDE.md, GEMINI.md, .cursor/rules or .agents/skills: one row per snapshot day, ${series.points.length} days from ${first.date} to ${last.date}.`,
    url: `${APP_URL}${REPORT_PATH}`,
    keywords: ["AGENTS.md", "CLAUDE.md", "AI coding agents", "adoption", "open source repositories"],
    isAccessibleForFree: true,
    temporalCoverage: `${first.date}/${last.date}`,
    dateModified: last.date,
    creator: { "@type": "Organization", name: APP_NAME, url: APP_URL },
    license: "https://opensource.org/licenses/MIT",
    isPartOf: { "@id": `${APP_URL}/#dataset` },
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: `${APP_URL}${REPORT_CSV_PATH}`,
    },
    variableMeasured: [
      "Repos scored",
      SERIES_LABEL.withFile,
      SERIES_LABEL.agentsMd,
      SERIES_LABEL.claudeMd,
      ...OTHER_FILES.map((f) => f.label),
    ],
  };
}
