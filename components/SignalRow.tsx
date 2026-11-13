import Link from "next/link";

import type { SignalResult } from "@/lib/scoring/signals/types";
import { checkPath } from "@/lib/utils/check-path";
import { hostLabel, percent } from "@/lib/utils/format";
import { matchesDirectory, repoFileUrl } from "@/lib/utils/repo-file-url";

const MARK_CLASSES = {
  ok: { cls: "tint-ok", label: "Pass" },
  bad: { cls: "tint-bad", label: "Fail" },
  partial: { cls: "tint-warn", label: "Partial" },
} as const;

function mark(pass: number): { key: keyof typeof MARK_CLASSES; ch: string } {
  if (pass >= 1) {
    return { key: "ok", ch: "✓" };
  }

  if (pass > 0) {
    return { key: "partial", ch: "~" };
  }

  return { key: "bad", ch: "✗" };
}

type RepoLocation = Parameters<typeof repoFileUrl>[0];

/** With `repo`, the matched path links to it on the default branch. Rows go in a `divide-y divide-line` list. */
export function SignalRow({ signal, repo }: { signal: SignalResult; repo?: RepoLocation }) {
  const m = mark(signal.pass);
  const { cls, label } = MARK_CLASSES[m.key];
  const path = signal.matchedPath;
  const href = path && repo ? repoFileUrl(repo, path, matchesDirectory(signal)) : null;

  return (
    <div className="check-row">
      <div role="img" aria-label={label} className={`mark-lg mt-0.5 ${cls}`}>
        {m.ch}
      </div>

      <div className="flex-1">
        <div className="text-[14.5px]">
          <Link href={checkPath(signal.id)} className="font-medium ink-link">
            {signal.label}
          </Link>
          <span className="check-pass">· {percent(signal.pass, 1)} pass</span>
        </div>

        <div className="check-detail">{signal.detail}</div>
        {path && (
          <div className="check-path">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="nofollow noopener noreferrer"
                aria-label={`${path} on ${hostLabel(repo?.host ?? "")} (new tab)`}
                className="text-muted hover:text-ink-soft"
              >
                {path}
              </a>
            ) : (
              path
            )}
          </div>
        )}
      </div>
    </div>
  );
}
