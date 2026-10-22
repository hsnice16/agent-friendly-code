"use client";

import { useEffect, useState } from "react";

import { track } from "@/lib/analytics-events";
import type { ImprovementSuggestion } from "@/lib/scoring/scorer";

import { Panel, PanelHeading } from "./Panel";
import { pillClass } from "./pill-class";
import { SuggestionItem } from "./SuggestionItem";

type Agent = { id: string; label: string; suggestions: ImprovementSuggestion[] };

/**
 * Buttons, not `?model=` links: a crawlable URL per agent, all canonical to
 * this page, only spends crawl budget. Reading the query in the browser keeps
 * old `?model=` links working on a static page.
 */
export function ModelSuggestionsSwitch({ agents }: { agents: Agent[] }) {
  const [selected, setSelected] = useState(agents[0].id);

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("model");
    if (wanted && agents.some((a) => a.id === wanted)) setSelected(wanted);
  }, [agents]);

  function pick(id: string) {
    setSelected(id);
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
            className={`${pillClass(a.id === agent.id)} cursor-pointer`}
          >
            {a.label}
          </button>
        ))}
      </fieldset>

      {/* A short status, not aria-live on the list: that read every fix aloud on each switch. */}
      <p role="status" className="sr-only">
        Showing fixes for {agent.label}
      </p>
      <div>
        {agent.suggestions.length === 0 ? (
          <div className="text-muted">Nothing to fix — this repo already has everything {agent.label} looks for.</div>
        ) : (
          <ol className="m-0 list-none p-0">
            {agent.suggestions.map((s, i) => (
              <SuggestionItem key={s.signalId} suggestion={s} index={i} />
            ))}
          </ol>
        )}
      </div>
    </Panel>
  );
}
