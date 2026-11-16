import raw from "@/data/file-census.json";

import { type CensusRepo, summarizeCensus } from "./file-census-summary";

export type { CensusRepo, CensusSummary } from "./file-census-summary";
export { summarizeCensus } from "./file-census-summary";

export const CENSUS = raw as unknown as { generatedAt: string; repos: CensusRepo[] };

export const CENSUS_SUMMARY = summarizeCensus(CENSUS.repos, CENSUS.generatedAt);
