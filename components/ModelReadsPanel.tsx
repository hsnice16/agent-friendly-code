import { pairLabels } from "@/lib/compare-copy";
import { pairsWith } from "@/lib/compare-pairs";
import { type ModelPanel, sourceLabel } from "@/lib/leaderboard-model-panel";
import type { ModelProfile } from "@/lib/scoring/weights";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { comparePath } from "@/lib/utils/compare-path";
import { percent } from "@/lib/utils/format";

import { ModelReadsPanelView } from "./ModelReadsPanelView";

/** Hrefs are resolved here: `checkPath` reads the signal registry, which can't ship to the client. */
export function ModelReadsPanel({ model, panel }: { model: ModelProfile; panel: ModelPanel }) {
  const { checks, sources, file } = panel;
  const claudeMd = file?.id === "claude_md";

  return (
    <ModelReadsPanelView
      modelId={model.id}
      modelLabel={model.label}
      checks={checks.map((c) => ({
        id: c.id,
        label: c.label,
        href: checkPath(c.id),
        weight: c.weight.toFixed(1),
        pass: percent(c.counts.full, c.counts.total),
      }))}
      file={
        file && {
          label: file.label,
          href: claudeMd ? checkSubPath("agents_md", "examples") : checkPath(file.id),
          present: file.present,
          total: file.total,
          claudeMd,
        }
      }
      pairs={pairsWith(model.id).map((p) => {
        const { a, b } = pairLabels(p);
        return { href: comparePath(p.slug), label: `${a} vs ${b}` };
      })}
      sources={sources.map((url) => ({ href: url, label: sourceLabel(url) }))}
    />
  );
}
