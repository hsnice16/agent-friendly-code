import type { ExampleLink } from "@/lib/agents-md-example-links";
import { COMPARE_ANCHOR, COMPARE_PAIRS } from "@/lib/compare-pairs";
import { type ModelPanel, sourceLabel } from "@/lib/leaderboard-model-panel";
import type { ModelProfile } from "@/lib/scoring/weights";
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
      compareHref={COMPARE_PAIRS.some((p) => p.a === model.id || p.b === model.id) ? COMPARE_ANCHOR : null}
      sources={sources.map((url) => ({ href: url, label: sourceLabel(url) }))}
      examples={examples}
    />
  );
}
