import { AGENT_SETUP } from "@/lib/agent-setup";
import { SIGNAL_TEXT } from "@/lib/signal-text";
import { checkPath } from "@/lib/utils/check-slug";
import { guidePath } from "@/lib/utils/guide-path";

import { CodeText } from "./CodeText";
import { IntentLink } from "./IntentLink";
import { LinkedText } from "./LinkedText";
import { Panel, PanelHeading } from "./Panel";

type Props = { modelId: keyof typeof AGENT_SETUP; modelLabel: string };

const ROW = "m-0 text-[14px] leading-relaxed text-ink-dim";
const TERM = "font-medium text-ink";

export function ModelSetupPanel({ modelId, modelLabel }: Props) {
  const a = AGENT_SETUP[modelId];

  return (
    <div id="setup" className="mb-5 scroll-mt-24">
      <Panel tone="tip">
        <PanelHeading tone="tip">Set up a repo for {modelLabel}</PanelHeading>
        <ol className="m-0 mb-3 ml-5 list-decimal text-[14px] leading-relaxed text-ink-dim">
          {a.setup.map((step) => (
            <li key={step}>
              <CodeText text={step} />
            </li>
          ))}
        </ol>
        <div className="flex max-w-[80ch] flex-col gap-2">
          <p className={ROW}>
            <span className={TERM}>What it reads: </span>
            <LinkedText text={a.reads} />
          </p>
          <p className={ROW}>
            <span className={TERM}>Setting needed: </span>
            <LinkedText text={a.needs} />
          </p>
          <p className={ROW}>
            <span className={TERM}>Check it loaded: </span>
            <LinkedText text={a.confirm} />
          </p>
        </div>
        <p className="mt-3 mb-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-muted">
          <span>Checks:</span>
          {a.checks.map((id) => (
            <IntentLink key={id} href={checkPath(id)} className="prose-link">
              {SIGNAL_TEXT[id].label}
            </IntentLink>
          ))}
          <IntentLink href={`${guidePath("agents-md-ignored")}#per-agent`} className="arrow-link">
            Not loading? Every agent compared →
          </IntentLink>
        </p>
      </Panel>
    </div>
  );
}
