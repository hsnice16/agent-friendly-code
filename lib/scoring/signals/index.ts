import { agentsMd } from "./agents-md";
import { aiderConf } from "./aider-conf";
import { ci } from "./ci";
import { contributing } from "./contributing";
import { cursorRules } from "./cursor-rules";
import { depsManifest } from "./deps-manifest";
import { devEnv } from "./dev-env";
import { geminiMd } from "./gemini-md";
import { license } from "./license";
import { linter } from "./linter";
import { openhandsSetup } from "./openhands-setup";
import { preCommit } from "./pre-commit";
import { readme } from "./readme";
import { size } from "./size";
import { tests } from "./tests";
import { typeConfig } from "./type-config";
import type { Signal, SignalResult } from "./types";

export type { Signal, SignalResult };

export const SIGNALS: Signal[] = [
  agentsMd,
  cursorRules,
  geminiMd,
  openhandsSetup,
  aiderConf,
  readme,
  tests,
  ci,
  linter,
  depsManifest,
  devEnv,
  typeConfig,
  license,
  contributing,
  preCommit,
  size,
];

export const SIGNAL_BY_ID: Record<string, Signal> = Object.fromEntries(SIGNALS.map((s) => [s.id, s]));

export function runAllSignals(repoPath: string): SignalResult[] {
  return SIGNALS.map((s) => {
    try {
      return s.check(repoPath);
    } catch (err) {
      return {
        pass: 0,
        id: s.id,
        label: s.label,
        detail: `check errored: ${(err as Error).message}`,
      };
    }
  });
}
