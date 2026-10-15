import Link from "next/link";

import type { SignalResult } from "@/lib/scoring/signals/types";
import { checkPath } from "@/lib/utils/check-path";
import { hostLabel, percent } from "@/lib/utils/format";
import { matchesDirectory, repoFileUrl } from "@/lib/utils/repo-file-url";

const MARK_CLASSES = {
  ok: { cls: "bg-ok/15 text-ok", label: "Pass" },
  bad: { cls: "bg-bad/15 text-bad", label: "Fail" },
  partial: { cls: "bg-warn/15 text-warn", label: "Partial" },
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

/** With `repo`, the matched path links to it on the default branch. */
export function SignalRow({ signal, repo }: { signal: SignalResult; repo?: RepoLocation }) {
  const m = mark(signal.pass);
  const { cls, label } = MARK_CLASSES[m.key];
  const path = signal.matchedPath;
  const href = path && repo ? repoFileUrl(repo, path, matchesDirectory(signal)) : null;

  return (
    <div className="flex items-start gap-3.5 border-b border-line py-3 last:border-b-0">
      <div
        role="img"
        aria-label={label}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cls}`}
      >
        <span aria-hidden="true">{m.ch}</span>
      </div>

      <div className="flex-1">
        <div className="text-[14.5px] font-medium">
          <Link href={checkPath(signal.id)} className="text-ink hover:text-ink-soft">
            {signal.label}
          </Link>
          <span className="ml-1.5 text-xs font-normal tabular-nums text-muted">· {percent(signal.pass, 1)} pass</span>
        </div>

        <div className="mt-0.5 text-[13.5px] text-ink-dim">{signal.detail}</div>
        {path && (
          <div className="mt-1 break-all font-mono text-xs text-muted">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="nofollow noopener noreferrer"
                aria-label={`${path} on ${hostLabel(repo?.host ?? "")} (new tab)`}
                className="text-muted underline-offset-4 hover:text-ink-soft hover:underline"
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
