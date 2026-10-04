import type { ImprovementSuggestion } from "@/lib/scoring/scorer";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";

import { ModelPills } from "./ModelPills";
import { Panel, PanelHeading } from "./Panel";
import { SuggestionItem } from "./SuggestionItem";

type Props = {
  /** Page the model pills link back to — the repo page or `/score/:host/:owner/:name`. */
  basePath: string;
  selected: ModelId;
  suggestions: ImprovementSuggestion[];
};

export function ModelSuggestions({ basePath, selected, suggestions }: Props) {
  return (
    <Panel>
      <PanelHeading>What to fix first</PanelHeading>

      <ModelPills
        scroll={false}
        selected={selected}
        hrefFor={(m) => `${basePath}?model=${m}`}
        label="Pick an AI agent"
      />

      {suggestions.length === 0 ? (
        <div className="text-muted">
          Nothing to fix — this repo already has everything {MODEL_BY_ID[selected].label} looks for.
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
