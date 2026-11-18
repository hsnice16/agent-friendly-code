import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, it } from "node:test";

// Everything a "use client" file imports ships to the browser. Next bundles a server
// module there without complaint (fs fails at runtime, data ships whole), so this walks
// the client graph and fails on the modules that must stay on the server.

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE_DIRS = ["app", "components", "lib"];

const FORBIDDEN_FILES: { pattern: RegExp; why: string }[] = [
  { pattern: /^lib\/db[\w-]*\.ts$/, why: "SQLite" },
  { pattern: /^lib\/scoring\/(signals\/|scorer\.ts$)/, why: "the scorer reads the filesystem" },
  { pattern: /^lib\/scoring\/weights\.ts$/, why: "every agent's weights and sources" },
  { pattern: /^lib\/ai-policy\.ts$/, why: "the whole policy dataset" },
  { pattern: /^lib\/clients\/git\.ts$/, why: "spawns git" },
  { pattern: /^data\//, why: "committed data files" },
];
const FORBIDDEN_PACKAGES = /^(node:|fs$|path$|os$|child_process$|better-sqlite3$)/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return sourceFiles(p);
    return /\.tsx?$/.test(name) ? [p] : [];
  });
}

/** Value imports and re-exports only: `import type` / `export type` erase at build. */
function imports(file: string): string[] {
  const src = readFileSync(file, "utf8");
  const specs: string[] = [];
  const re = /^\s*(import|export)\s+(type\s+)?[^;]*?\bfrom\s+["']([^"']+)["']|^\s*import\s+["']([^"']+)["']/gm;
  for (const m of src.matchAll(re)) {
    if (m[2]) continue;
    // `import { type A, type B } from` imports nothing at runtime either.
    const named = /\{([^}]*)\}/.exec(m[0]);
    const onlyTypes =
      named && !/import\s+\w+\s*,/.test(m[0]) && named[1].split(",").every((s) => /^\s*type\s/.test(s) || !s.trim());
    if (onlyTypes) continue;
    specs.push(m[3] ?? m[4]);
  }
  return specs;
}

function resolveSpec(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  for (const c of ["", ".ts", ".tsx", ".json", "/index.ts", "/index.tsx"]) {
    if (existsSync(base + c) && statSync(base + c).isFile()) return base + c;
  }
  return null;
}

function violations(): string[] {
  const entries = SOURCE_DIRS.flatMap((d) => sourceFiles(join(ROOT, d))).filter((f) =>
    /^\s*["']use client["']/.test(readFileSync(f, "utf8")),
  );
  const found: string[] = [];
  const seen = new Set<string>();
  const queue = entries.map((f) => ({ file: f, via: [relative(ROOT, f)] }));
  for (let item = queue.shift(); item; item = queue.shift()) {
    if (seen.has(item.file)) continue;
    seen.add(item.file);
    for (const spec of imports(item.file)) {
      if (FORBIDDEN_PACKAGES.test(spec)) {
        found.push(`${item.via.join(" → ")} imports ${spec}`);
        continue;
      }
      const target = resolveSpec(item.file, spec);
      if (!target) continue;
      const rel = relative(ROOT, target);
      const hit = FORBIDDEN_FILES.find((f) => f.pattern.test(rel));
      if (hit) {
        found.push(`${item.via.join(" → ")} → ${rel} (${hit.why})`);
        continue;
      }
      if (/\.tsx?$/.test(target)) queue.push({ file: target, via: [...item.via, rel] });
    }
  }
  return found;
}

describe("client components", () => {
  it("never reach a server-only module", () => {
    assert.deepEqual(violations(), []);
  });
});
