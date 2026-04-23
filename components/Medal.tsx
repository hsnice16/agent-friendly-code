// All ranks render inside an identically sized 24×24 box so numbers align
// across rows regardless of whether a medal is shown.

const MEDAL_CLASSES = [
  "bg-[rgba(232,198,106,0.22)] text-warn",
  "bg-[rgba(184,184,184,0.18)] text-ink-dim",
  "bg-[rgba(219,118,118,0.18)] text-bad",
];

const MEDAL_LABELS = ["First place", "Second place", "Third place"];

const BOX = "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums";

export function Medal({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span role="img" aria-label={MEDAL_LABELS[rank - 1]} className={`${BOX} ${MEDAL_CLASSES[rank - 1]}`}>
        {rank}
      </span>
    );
  }
  return (
    <span role="img" aria-label={`Rank ${rank}`} className={`${BOX} font-normal text-muted`}>
      {rank}
    </span>
  );
}
