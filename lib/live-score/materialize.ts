import { mkdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import type { RepoHost } from "../clients/github";
import { resolveRelative } from "../scoring/signals/helpers";
import { CONTENT_CANDIDATES } from "./content-files";
import { blobUrl, hostToken, listTree, rawUrl, requestHeaders, type TreeEntry } from "./hosts";

const CONCURRENCY = 8;

export type Materialized = { sha: string; entries: number };

async function pooled<T>(items: T[], fn: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let next = queue.shift(); next !== undefined; next = queue.shift()) await fn(next);
    }),
  );
}

// The only thing standing between an attacker-chosen path and the filesystem.
export function safeAbsolute(dest: string, path: string): string | null {
  if (!path || path.startsWith("/") || path.split("/").includes("..")) return null;
  const abs = join(dest, path);
  return resolve(abs).startsWith(resolve(dest) + sep) ? abs : null;
}

async function linkTargets(
  host: RepoHost,
  owner: string,
  name: string,
  ref: string,
  dest: string,
  symlinks: TreeEntry[],
  headers: Record<string, string>,
): Promise<void> {
  await pooled(symlinks, async (entry) => {
    // Never trim the target: vercel/ai commits "packages/ai/README.md\n", so git
    // leaves the link dangling. Trimming would repair it and invent a README the
    // real pipeline never sees.
    let target: string | null = null;

    const res = await fetch(rawUrl(host, owner, name, ref, entry.path), { headers });
    if (res.ok) {
      target = await res.text();
    } else if (entry.sha) {
      const blob = blobUrl(host, owner, name, entry.sha);
      if (blob) {
        const blobRes = await fetch(blob, { headers: { ...headers, Accept: "application/vnd.github.raw+json" } });
        if (blobRes.ok) target = await blobRes.text();
      }
    }

    // No target, or an empty one: keep the placeholder. Removing it would drop
    // the entry from `size`'s file count, which a clone still counts.
    if (!target) return;

    const abs = safeAbsolute(dest, entry.path);
    if (!abs) return;

    try {
      rmSync(abs, { force: true });
      symlinkSync(target, abs);
    } catch {
      try {
        writeFileSync(abs, "");
      } catch {}
    }
  });
}

async function fetchContent(
  host: RepoHost,
  owner: string,
  name: string,
  ref: string,
  dest: string,
  headers: Record<string, string>,
): Promise<void> {
  // realpathSync resolves symlinks in the *base* path too, so a /tmp dest comes
  // back as /private/tmp on macOS; relativising against `dest` would emit
  // ../../private/tmp/… and every fetch would 404 into an empty file.
  const root = realpathSync(dest);

  const wanted = new Set<string>();
  for (const candidate of CONTENT_CANDIDATES) {
    // The scorer's own case-insensitive lookup, then the OS follows any symlink:
    // whichever file scoring will actually read is the one we fetch.
    const hit = resolveRelative(dest, candidate);
    if (!hit) continue;
    try {
      const real = realpathSync(join(dest, hit));
      if (statSync(real).isDirectory()) continue;
      wanted.add(relative(root, real));
    } catch {}
  }

  await pooled([...wanted], async (path) => {
    const res = await fetch(rawUrl(host, owner, name, ref, path), { headers });
    if (!res.ok) return;
    writeFileSync(join(root, path), await res.text());
  });
}

/**
 * Build a directory `scoreRepo()` reads identically to a `git clone` of `ref`.
 *
 * Every path exists; only the files a signal reads carry real bytes. Callers own
 * cleanup — wrap in try/finally with rmSync.
 */
export async function materialize(
  host: RepoHost,
  owner: string,
  name: string,
  ref: string,
  dest: string,
): Promise<Materialized> {
  const token = hostToken(host);
  const headers = requestHeaders(host, token);
  const entries = await listTree(host, owner, name, ref, token);

  mkdirSync(dest, { recursive: true });

  const symlinks: TreeEntry[] = [];

  for (const entry of entries) {
    const abs = safeAbsolute(dest, entry.path);
    if (!abs) continue;

    if (entry.kind === "dir") {
      mkdirSync(abs, { recursive: true });
      continue;
    }

    mkdirSync(dirname(abs), { recursive: true });
    // Placeholder first, symlinks included: a link to a file counts as one file
    // either way, so a failed target lookup degrades instead of dropping the
    // entry from `size`'s count.
    writeFileSync(abs, "");
    if (entry.kind === "symlink") symlinks.push(entry);
  }

  await linkTargets(host, owner, name, ref, dest, symlinks, headers);
  await fetchContent(host, owner, name, ref, dest, headers);

  return { sha: ref, entries: entries.length };
}
