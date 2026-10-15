// Shallow because the scorer reads only the working tree. Anything that needs
// history would need a host API or a `--filter=blob:none` partial clone.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";

export function shallowClone(cloneUrl: string, dest: string): Promise<void> {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }

  mkdirSync(dest, { recursive: true });

  return new Promise((resolve, reject) => {
    const proc = spawn(
      "git",
      ["clone", "--depth", "1", "--single-branch", "--no-tags", "--quiet", "--", cloneUrl, dest],
      {
        stdio: ["ignore", "pipe", "pipe"],
        // A repo that went private or away asks for credentials; fail instead of waiting on a prompt.
        // LFS objects are never scored, and a repo can make them arbitrarily large.
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_LFS_SKIP_SMUDGE: "1" },
      },
    );

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
