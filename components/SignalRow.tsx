import type { SignalResult } from "@/lib/scoring/signals/types";

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

export function SignalRow({ signal }: { signal: SignalResult }) {
  const m = mark(signal.pass);
  const { cls, label } = MARK_CLASSES[m.key];

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
          {signal.label}
          <span className="ml-1.5 text-xs font-normal tabular-nums text-muted">
            · {(signal.pass * 100).toFixed(0)}% pass
          </span>
        </div>

        <div className="mt-0.5 text-[13.5px] text-ink-dim">{signal.detail}</div>
        {signal.matchedPath && <div className="mt-1 break-all font-mono text-xs text-muted">{signal.matchedPath}</div>}
      </div>
    </div>
  );
}
