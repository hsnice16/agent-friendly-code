import raw from "@/data/agents-md-contents.json";

import { buildContentsReport, type ContentsData } from "./agents-md-contents-report";

export const CONTENTS_DATA = raw as unknown as ContentsData;

export const CONTENTS_REPORT = buildContentsReport(CONTENTS_DATA);
