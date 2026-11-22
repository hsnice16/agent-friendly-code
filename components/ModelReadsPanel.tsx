import type { ExampleLink } from "@/lib/agents-md-example-links";
import { pairLabels } from "@/lib/compare-copy";
import { pairsWith } from "@/lib/compare-pairs";
import { type ModelPanel, sourceLabel } from "@/lib/leaderboard-model-panel";
import type { ModelProfile } from "@/lib/scoring/weights";
import { comparePath } from "@/lib/utils/compare-path";
import { percent } from "@/lib/utils/format";

import { ModelReadsPanelView } from "./ModelReadsPanelView";

export function ModelReadsPanel({
  model,
  panel,
  examples = [],
}: {
  model: ModelProfile;
  panel: ModelPanel;
  examples?: ExampleLink[];
}) {
  const { checks, sources, file } = panel;

  return (
    <ModelReadsPanelView
      modelId={model.id}
      modelLabel={model.label}
      checks={checks.map((c) => ({
        id: c.id,
        weight: c.weight.toFixed(1),
        pass: percent(c.counts.full, c.counts.total),
      }))}
      file={file && { id: file.id, present: file.present, total: file.total }}
      pairs={pairsWith(model.id).map((p) => {
        const { a, b } = pairLabels(p);
        return { href: comparePath(p.slug), label: `${a} vs ${b}` };
      })}
      sources={sources.map((url) => ({ href: url, label: sourceLabel(url) }))}
      examples={examples}
    />
  );
}
