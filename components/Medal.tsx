const MEDAL_CLASSES = [
  "bg-[rgba(232,198,106,0.22)] text-warn",
  "bg-[rgba(184,184,184,0.18)] text-ink-dim",
  "bg-[rgba(219,118,118,0.18)] text-bad",
];

const MEDAL_LABELS = ["First place", "Second place", "Third place"];

export function Medal({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span role="img" aria-label={MEDAL_LABELS[rank - 1]} className={`rank-box font-bold ${MEDAL_CLASSES[rank - 1]}`}>
        {rank}
      </span>
    );
  }
  // Colour and tabular figures come from the rank cell.
  return (
    <span role="img" aria-label={`Rank ${rank}`} className="rank-box">
      {rank}
    </span>
  );
}
