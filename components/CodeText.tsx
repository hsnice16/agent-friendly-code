/** Renders `backticked` spans of a plain string as inline code. */
export function CodeText({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: a static string's parts never reorder
      <code key={i} className="rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-[0.86em] text-ink">
        {part}
      </code>
    ) : (
      part
    ),
  );
}
