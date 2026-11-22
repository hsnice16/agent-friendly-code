"use client";

import { SIGNAL_TEXT } from "@/lib/signal-text";
import { checkPath } from "@/lib/utils/check-slug";
import { hostLabel, percent } from "@/lib/utils/format";
import { matchesDirectory, repoFileUrl } from "@/lib/utils/repo-file-url";

import { IntentLink } from "./IntentLink";

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

export type SignalRowData = { id: string; pass: number; detail: string; path?: string };
export type RepoLocation = Parameters<typeof repoFileUrl>[0];

export function SignalRowsView({ rows, repo }: { rows: SignalRowData[]; repo?: RepoLocation }) {
  return (
    <div className="divide-y divide-line">
      {rows.map((s) => (
        <SignalRow key={s.id} signal={s} repo={repo} />
      ))}
    </div>
  );
}

function SignalRow({ signal, repo }: { signal: SignalRowData; repo?: RepoLocation }) {
  const m = mark(signal.pass);
  const { cls, label } = MARK_CLASSES[m.key];
  const path = signal.path;
  const href =
    path && repo
      ? repoFileUrl(repo, path, matchesDirectory({ id: signal.id, pass: signal.pass, matchedPath: path }))
      : null;

  return (
    <div className="check-row">
      <div role="img" aria-label={label} className={`mark-lg mt-0.5 ${cls}`}>
        {m.ch}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[14.5px]">
          <IntentLink href={checkPath(signal.id)} className="font-medium ink-link">
            {SIGNAL_TEXT[signal.id].label}
          </IntentLink>
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
                className="text-muted hover:text-ink"
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
