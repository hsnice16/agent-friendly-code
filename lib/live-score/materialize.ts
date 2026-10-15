import { mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

import type { RepoHost } from "../clients/github";
import { entryKind, MAX_READ_BYTES, resolveRelative } from "../scoring/signals/helpers";
import { CONTENT_CANDIDATES } from "./content-files";
import { blobUrl, hostToken, listTree, rawUrl, requestHeaders, type TreeEntry } from "./hosts";
import { pooled, readCapped, timedFetch } from "./http";

// A tree can hold up to MAX_ENTRIES links, and each request or blob lookup is a
// call against the shared token. Past these caps a link keeps its placeholder,
// which the scorer reads exactly like a link it would not follow.
const MAX_LINK_LOOKUPS = 1000;
const MAX_BLOB_LOOKUPS = 200;

// One past PATH_MAX, so an over-long target still fails to link as it did uncapped.
const MAX_LINK_TARGET_BYTES = 4097;

type Materialized = { sha: string; entries: number };

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
  deadline?: AbortSignal,
): Promise<Set<string>> {
  const placeholders = new Set(symlinks.slice(MAX_LINK_LOOKUPS).map((e) => e.path));
  let blobLookups = 0;

  const text = async (res: Response) => new TextDecoder().decode(await readCapped(res, MAX_LINK_TARGET_BYTES));

  await pooled(symlinks.slice(0, MAX_LINK_LOOKUPS), async (entry) => {
    // Never trim the target: vercel/ai commits "packages/ai/README.md\n", so git
    // leaves the link dangling. Trimming would repair it and invent a README the
    // real pipeline never sees.
    let target: string | null = null;

    const res = await timedFetch(rawUrl(host, owner, name, ref, entry.path), { headers }, deadline);
    if (res.ok) {
      target = await text(res);
    } else if (entry.sha && blobLookups < MAX_BLOB_LOOKUPS) {
      const blob = blobUrl(host, owner, name, entry.sha);
      if (blob) {
        blobLookups++;
        const blobHeaders = { ...headers, Accept: "application/vnd.github.raw+json" };
        const blobRes = await timedFetch(blob, { headers: blobHeaders }, deadline);
        if (blobRes.ok) target = await text(blobRes);
      }
    }

    const abs = safeAbsolute(dest, entry.path);

    // No target, an empty one, or one leading out of the tree (an absolute path,
    // ../, the root itself): keep the placeholder. Removing it would drop the
    // entry from `size`'s file count, which a clone still counts.
    if (!target || !abs || !resolve(dirname(abs), target).startsWith(resolve(dest) + sep)) {
      placeholders.add(entry.path);
      return;
    }

    try {
      rmSync(abs, { force: true });
      symlinkSync(target, abs);
    } catch {
      placeholders.add(entry.path);
      try {
        writeFileSync(abs, "");
      } catch {}
    }
  });

  return placeholders;
}

async function fetchContent(
  host: RepoHost,
  owner: string,
  name: string,
  ref: string,
  dest: string,
  headers: Record<string, string>,
  placeholders: Set<string>,
  deadline?: AbortSignal,
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
    if (!hit || entryKind(dest, join(dest, hit)) !== "file") continue;
    try {
      const rel = relative(root, realpathSync(join(dest, hit)));
      // A placeholder's raw URL would serve a link the scorer never follows.
      if (!rel || rel.startsWith("..") || isAbsolute(rel) || placeholders.has(rel)) continue;
      wanted.add(rel);
    } catch {}
  }

  await pooled([...wanted], async (path) => {
    const res = await timedFetch(rawUrl(host, owner, name, ref, path), { headers }, deadline);
    if (!res.ok) return;
    // The scorer reads no further than MAX_READ_BYTES either.
    writeFileSync(join(root, path), await readCapped(res, MAX_READ_BYTES));
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
  deadline?: AbortSignal,
): Promise<Materialized> {
  const token = hostToken(host);
  const headers = requestHeaders(host, token);
  const entries = await listTree(host, owner, name, ref, token, deadline);

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

  const placeholders = await linkTargets(host, owner, name, ref, dest, symlinks, headers, deadline);
  await fetchContent(host, owner, name, ref, dest, headers, placeholders, deadline);

  return { sha: ref, entries: entries.length };
}
