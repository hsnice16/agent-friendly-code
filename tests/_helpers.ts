import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export type FixtureFiles = Record<string, string>;

export function makeFixture(files: FixtureFiles): string {
  const root = mkdtempSync(join(tmpdir(), "afc-fixture-"));

  for (const [rel, content] of Object.entries(files)) {
    const abs = join(root, rel);

    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }

  return root;
}

export function removeFixture(root: string): void {
  rmSync(root, { recursive: true, force: true });
}
