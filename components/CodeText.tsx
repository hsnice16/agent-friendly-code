// A short chip stays on one line; a long path or command may break anywhere,
// or it would overflow a phone-width column.
const NOWRAP_MAX = 24;

const CHIP = "rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-[0.86em] text-ink";

/** Renders `backticked` spans of a plain string as inline code. */
export function CodeText({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 === 1 ? (
      <code
        // biome-ignore lint/suspicious/noArrayIndexKey: a static string's parts never reorder
        key={i}
        className={`${CHIP} ${part.length <= NOWRAP_MAX ? "whitespace-nowrap" : "[overflow-wrap:anywhere]"}`}
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}
