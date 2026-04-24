import type { ImprovementSuggestion } from "@/lib/scoring/scorer";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";

import { ModelPills } from "./ModelPills";
import { Panel, PanelHeading } from "./Panel";
import { SuggestionItem } from "./SuggestionItem";

type Props = {
  repoId: number;
  selected: ModelId;
  suggestions: ImprovementSuggestion[];
};

export function ModelSuggestions({ repoId, selected, suggestions }: Props) {
  return (
    <Panel>
      <PanelHeading>Suggestions to improve for a specific model</PanelHeading>

      <ModelPills
        scroll={false}
        selected={selected}
        hrefFor={(m) => `/repo/${repoId}?model=${m}`}
        label="Select a model for per-model suggestions"
      />

      {suggestions.length === 0 ? (
        <div className="text-muted">
          No gaps — this repo is already maxing out {MODEL_BY_ID[selected].label}&apos;s rubric.
        </div>
      ) : (
        <ol className="m-0 list-none p-0">
          {suggestions.map((s, i) => (
            <SuggestionItem key={s.signalId} suggestion={s} index={i} />
          ))}
        </ol>
      )}
    </Panel>
  );
}
