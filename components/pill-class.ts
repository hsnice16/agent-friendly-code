// Its own module so the client agent switch can import it without pulling
// ModelPills' MODELS weight tables into the browser bundle.
const INACTIVE = "pill pill-off";
const ACTIVE = "pill border-line-strong bg-surface-hover text-ink";

export function pillClass(active: boolean): string {
  return active ? ACTIVE : INACTIVE;
}
