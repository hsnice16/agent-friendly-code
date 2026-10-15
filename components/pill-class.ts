// Its own module so the client agent switch can import it without pulling
// ModelPills' MODELS weight tables into the browser bundle.
const BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors";
const INACTIVE = "border-line bg-transparent text-ink-dim hover:bg-surface-hover hover:text-ink";
const ACTIVE = "border-line-strong bg-surface-hover text-ink";

export function pillClass(active: boolean): string {
  return `${BASE} ${active ? ACTIVE : INACTIVE}`;
}
