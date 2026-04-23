import Link from "next/link";
import { MODELS, type ModelId } from "@/lib/scoring/weights";

type Props = {
  label?: string;
  scroll?: boolean;
  includeOverall?: boolean;
  selected: ModelId | "overall";
  hrefFor: (id: ModelId | "overall") => string;
};

const BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors";
const INACTIVE = "border-line bg-transparent text-ink-dim hover:bg-surface-hover hover:text-ink";
const ACTIVE = "border-line-strong bg-surface-hover text-ink";

export function ModelPills({
  hrefFor,
  selected,
  scroll = true,
  includeOverall = false,
  label = "Select a model",
}: Props) {
  return (
    <nav aria-label={label} className="mb-4 flex flex-wrap gap-2">
      {includeOverall && (
        <Link
          scroll={scroll}
          href={hrefFor("overall")}
          aria-pressed={selected === "overall"}
          className={`${BASE} ${selected === "overall" ? ACTIVE : INACTIVE}`}
        >
          Overall
        </Link>
      )}

      {MODELS.map((m) => (
        <Link
          key={m.id}
          scroll={scroll}
          href={hrefFor(m.id)}
          aria-pressed={selected === m.id}
          className={`${BASE} ${selected === m.id ? ACTIVE : INACTIVE}`}
        >
          {m.label}
        </Link>
      ))}
    </nav>
  );
}
