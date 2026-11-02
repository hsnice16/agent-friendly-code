import Link from "next/link";

import type { ModelId } from "@/lib/scoring/weights";
import { pillClass } from "./pill-class";

type BoardId = ModelId | "overall";

type Props = {
  agents: { id: BoardId; label: string }[];
  selected: BoardId;
  prefetch: boolean;
  hrefFor: (id: BoardId) => string;
};

/** ModelPills for the board, fed labels by the server so the client bundle skips the weights. */
export function BoardAgentPills({ agents, selected, prefetch, hrefFor }: Props) {
  return (
    <nav aria-label="Pick an AI agent" className="mb-4 flex flex-wrap gap-2">
      {agents.map((a) => (
        <Link
          key={a.id}
          href={hrefFor(a.id)}
          prefetch={prefetch ? undefined : false}
          aria-current={selected === a.id ? "true" : undefined}
          className={pillClass(selected === a.id)}
        >
          {a.label}
        </Link>
      ))}
    </nav>
  );
}
