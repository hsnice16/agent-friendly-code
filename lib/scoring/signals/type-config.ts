import { existsSync } from "node:fs";
import { join } from "node:path";

import { firstExisting, readSafe } from "./helpers";
import type { Signal } from "./types";

const CANDIDATES = ["tsconfig.json", "jsconfig.json", "mypy.ini", ".mypy.ini", "pyrightconfig.json"];
const PYPROJECT_RE = /\[tool\.(mypy|pyright)/;

export const typeConfig: Signal = {
  id: "type_config",
  label: "Type configuration",
  description: "Static types help agents reason about call sites without running code.",
  improveSuggestion:
    "Add a type config (tsconfig.json for JS/TS, mypy.ini or pyrightconfig.json for Python). Rust/Go are typed by default.",
  check: (repo) => {
    const m = firstExisting(repo, CANDIDATES);

    if (m) {
      return {
        pass: 1,
        matchedPath: m,
        id: "type_config",
        label: "Type configuration",
        detail: "Type config present",
      };
    }

    const pyproject = join(repo, "pyproject.toml");
    if (existsSync(pyproject) && PYPROJECT_RE.test(readSafe(pyproject))) {
      return {
        pass: 1,
        id: "type_config",
        label: "Type configuration",
        matchedPath: "pyproject.toml",
        detail: "Configured in pyproject.toml",
      };
    }

    if (existsSync(join(repo, "Cargo.toml")) || existsSync(join(repo, "go.mod"))) {
      return {
        pass: 1,
        id: "type_config",
        label: "Type configuration",
        detail: "Typed language (Rust/Go)",
      };
    }

    return {
      pass: 0,
      id: "type_config",
      label: "Type configuration",
      detail: "No type config found",
    };
  },
};
