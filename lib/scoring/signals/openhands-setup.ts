import { join } from "node:path";

import { characters, readSafe, resolveRelative } from "./helpers";
import type { Signal } from "./types";

const LABEL = ".openhands/setup.sh";
const REL = ".openhands/setup.sh";

export const openhandsSetup: Signal = {
  label: LABEL,
  id: "openhands_setup",
  description: "`.openhands/setup.sh`, which OpenHands runs at session start to set up the dev environment.",
  improveSuggestion:
    "Add a `.openhands/setup.sh` that installs dependencies and prepares the project so OpenHands can run tests and lints out of the box.",
  check: (repo) => {
    const rel = resolveRelative(repo, REL);

    if (!rel) {
      return {
        pass: 0,
        label: LABEL,
        id: "openhands_setup",
        detail: "No .openhands/setup.sh",
      };
    }

    const len = readSafe(join(repo, rel), repo).trim().length;
    if (len === 0) {
      return {
        pass: 0.2,
        label: LABEL,
        matchedPath: rel,
        id: "openhands_setup",
        detail: "Empty .openhands/setup.sh",
      };
    }

    return {
      pass: 1,
      label: LABEL,
      matchedPath: rel,
      id: "openhands_setup",
      detail: `Setup script present (${characters(len)})`,
    };
  },
};
