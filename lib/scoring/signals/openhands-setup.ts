import { existsSync } from "node:fs";
import { join } from "node:path";

import { readSafe } from "./helpers";
import type { Signal } from "./types";

const LABEL = ".openhands/setup.sh";
const REL = ".openhands/setup.sh";

export const openhandsSetup: Signal = {
  label: LABEL,
  id: "openhands_setup",
  description: "OpenHands runs `.openhands/setup.sh` at session start to bootstrap the repo's dev environment.",
  improveSuggestion:
    "Add a `.openhands/setup.sh` that installs dependencies and prepares the project so OpenHands can run tests and lints out of the box.",
  check: (repo) => {
    const abs = join(repo, REL);

    if (!existsSync(abs)) {
      return {
        pass: 0,
        label: LABEL,
        id: "openhands_setup",
        detail: "No .openhands/setup.sh",
      };
    }

    const len = readSafe(abs).trim().length;
    if (len === 0) {
      return {
        pass: 0.2,
        label: LABEL,
        matchedPath: abs,
        id: "openhands_setup",
        detail: "Empty .openhands/setup.sh",
      };
    }

    return {
      pass: 1,
      label: LABEL,
      matchedPath: abs,
      id: "openhands_setup",
      detail: `Setup script present (${len} chars)`,
    };
  },
};
