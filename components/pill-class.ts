// Its own module so client components can import it without pulling the
// MODELS weight tables into the browser bundle.
const INACTIVE = "pill pill-off";
const ACTIVE = "pill border-line-strong bg-surface-hover text-ink";

export function pillClass(active: boolean): string {
  return active ? ACTIVE : INACTIVE;
}
