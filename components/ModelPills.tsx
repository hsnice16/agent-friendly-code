import Link from "next/link";
import { MODELS, type ModelId } from "@/lib/scoring/weights";

import { pillClass } from "./pill-class";

type Props = {
  scroll?: boolean;
  selected: ModelId;
  hrefFor: (id: ModelId) => string;
};

export function ModelPills({ hrefFor, selected, scroll = true }: Props) {
  return (
    <nav aria-label="Pick an AI agent" className="mb-4 flex flex-wrap gap-2">
      {MODELS.map((m) => (
        <Link
          key={m.id}
          scroll={scroll}
          href={hrefFor(m.id)}
          aria-current={selected === m.id ? "true" : undefined}
          className={pillClass(selected === m.id)}
        >
          {m.label}
        </Link>
      ))}
    </nav>
  );
}
