"use client";

import { startTransition, useEffect, useState } from "react";

import { track } from "@/lib/analytics-events";
import { MODEL_LABEL } from "@/lib/model-labels";
import { SIGNAL_TEXT } from "@/lib/signal-text";
import type { SwitchAgent } from "@/lib/utils/suggestion-switch";

import { Panel, PanelHeading } from "./Panel";
import { pillClass } from "./pill-class";
import { SuggestionItem } from "./SuggestionItem";

/**
 * Buttons, not `?model=` links: a crawlable URL per agent, all canonical to
 * this page, only spends crawl budget. Reading the query in the browser keeps
 * old `?model=` links working on a static page.
 */
export function ModelSuggestionsSwitch({
  agents,
  initial,
}: {
  agents: SwitchAgent[];
  /** For a page rendered per request, which can read `?model=` before the first paint. */
  initial?: string;
}) {
  const [selected, setSelected] = useState(initial && agents.some((a) => a.id === initial) ? initial : agents[0].id);

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("model");
    if (wanted && agents.some((a) => a.id === wanted)) setSelected(wanted);
  }, [agents]);

  function pick(id: string) {
    // Non-blocking, so the click paints before the new list renders (INP).
    startTransition(() => setSelected(id));
    const url = new URL(window.location.href);
    url.searchParams.set("model", id);
    window.history.replaceState(window.history.state, "", url);
  }

  const agent = agents.find((a) => a.id === selected) ?? agents[0];

  return (
    <Panel>
      <PanelHeading>What to fix first</PanelHeading>

      <fieldset className="m-0 mb-4 flex flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">Pick an AI agent</legend>
        {agents.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={a.id === agent.id}
            onClick={() => {
              pick(a.id);
              track({ name: "select_agent", agent: a.id });
            }}
            className={pillClass(a.id === agent.id)}
          >
            {MODEL_LABEL[a.id]}
          </button>
        ))}
      </fieldset>

      {/* A short status, not aria-live on the list: that read every fix aloud on each switch. */}
      <p role="status" className="sr-only">
        Showing fixes for {MODEL_LABEL[agent.id]}
      </p>
      {agent.fixes.length === 0 ? (
        <div className="text-muted">
          Nothing to fix — this repo already has everything {MODEL_LABEL[agent.id]} looks for.
        </div>
      ) : (
        <ol className="m-0 list-none divide-y divide-line p-0">
          {agent.fixes.map(([signalId, scoreGain], i) => (
            <SuggestionItem key={signalId} suggestion={{ ...SIGNAL_TEXT[signalId], scoreGain }} index={i} />
          ))}
        </ol>
      )}
    </Panel>
  );
}
