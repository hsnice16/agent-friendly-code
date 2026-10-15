import Link from "next/link";
import { MODELS, type ModelId } from "@/lib/scoring/weights";

import { pillClass } from "./pill-class";

type Props = {
  label?: string;
  scroll?: boolean;
  includeOverall?: boolean;
  selected: ModelId | "overall";
  hrefFor: (id: ModelId | "overall") => string;
};

export function ModelPills({
  hrefFor,
  selected,
  scroll = true,
  includeOverall = false,
  label = "Pick an AI agent",
}: Props) {
  return (
    <nav aria-label={label} className="mb-4 flex flex-wrap gap-2">
      {includeOverall && (
        <Link
          scroll={scroll}
          href={hrefFor("overall")}
          aria-pressed={selected === "overall"}
          className={pillClass(selected === "overall")}
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
          className={pillClass(selected === m.id)}
        >
          {m.label}
        </Link>
      ))}
    </nav>
  );
}
