import { existsSync } from "node:fs";
import { join } from "node:path";

import { readSafe } from "./helpers";
import type { Signal } from "./types";

const ARTIFACTS = [
  "Makefile",
  "makefile",
  ".devcontainer/devcontainer.json",
  ".devcontainer.json",
  "flake.nix",
  "shell.nix",
  "Dockerfile",
  "docker-compose.yml",
  "compose.yml",
  "justfile",
  "Taskfile.yml",
];

export const devEnv: Signal = {
  id: "dev_env",
  label: "Reproducible dev env",
  description: "One-command setup the agent can run (Makefile / devcontainer / Nix / Docker).",
  improveSuggestion: "Add a Makefile or devcontainer or Dockerfile so the agent can set up the project in one command.",
  check: (repo) => {
    const matches = ARTIFACTS.filter((c) => existsSync(join(repo, c)));

    if (matches.length >= 2) {
      return {
        pass: 1,
        id: "dev_env",
        matchedPath: matches[0],
        label: "Reproducible dev env",
        detail: `${matches.length} env artifacts (${matches.slice(0, 2).join(", ")})`,
      };
    }

    if (matches.length === 1) {
      return {
        pass: 0.7,
        id: "dev_env",
        matchedPath: matches[0],
        detail: `Has ${matches[0]}`,
        label: "Reproducible dev env",
      };
    }

    const pkg = join(repo, "package.json");
    if (existsSync(pkg)) {
      try {
        const j = JSON.parse(readSafe(pkg));

        if (j.scripts && Object.keys(j.scripts).length >= 3) {
          return {
            pass: 0.6,
            id: "dev_env",
            matchedPath: "package.json",
            label: "Reproducible dev env",
            detail: `package.json has ${Object.keys(j.scripts).length} scripts`,
          };
        }
      } catch {}
    }

    return {
      pass: 0,
      id: "dev_env",
      label: "Reproducible dev env",
      detail: "No Makefile / devcontainer / Docker / equivalent found",
    };
  },
};
