import type { AgentsMdGuide } from "../framework-guides/types";
import { GO } from "./go";
import { JAVA } from "./java";
import { PYTHON } from "./python";
import { RUST } from "./rust";
import { TYPESCRIPT } from "./typescript";

/** Keyed by language slug; a language page without one stays a list of examples. */
export const LANGUAGE_GUIDES: Record<string, AgentsMdGuide> = Object.fromEntries(
  [GO, PYTHON, TYPESCRIPT, RUST, JAVA].map((g) => [g.slug, g]),
);
