// Why shallow (--depth 1 --single-branch)?
//   - The static signal scorer only needs the current working tree, not history.
//   - Skipping history keeps huge repos (gigabytes of log) manageable.
//   - Tradeoff: no git log / blame — anything that needs commit history
//     would need a host API or `--filter=blob:none` partial clones.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";

export function shallowClone(cloneUrl: string, dest: string): Promise<void> {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }

  mkdirSync(dest, { recursive: true });

  return new Promise((resolve, reject) => {
    const proc = spawn("git", ["clone", "--depth", "1", "--single-branch", "--quiet", cloneUrl, dest], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`git clone failed (${code}): ${stderr.trim()}`));
      }
    });

    proc.on("error", reject);
  });
}
