import type { Faq } from "@/lib/agents-faq";
import { formatDay } from "@/lib/utils/format";

import { CodeText } from "./CodeText";
import { FaqList } from "./FaqList";
import { Panel, PanelHeading } from "./Panel";

export function AgentsMdFaq({ faqs, checked }: { faqs: Faq[]; checked: string }) {
  return (
    <Panel>
      <PanelHeading>Does my agent read AGENTS.md?</PanelHeading>
      <FaqList items={faqs.map((f) => ({ key: f.question, q: f.question, a: <CodeText text={f.answer} /> }))} />
      <p className="mt-3 mb-0 text-[13px] text-muted">
        Checked against each tool&apos;s docs on <time dateTime={checked}>{formatDay(checked)}</time>.
      </p>
    </Panel>
  );
}
