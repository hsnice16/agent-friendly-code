import type { Faq } from "@/lib/agents-faq";
import { formatDay } from "@/lib/utils/format";

import { FaqSection } from "./FaqSection";

export function AgentsMdFaq({ faqs, checked }: { faqs: Faq[]; checked: string }) {
  return (
    <FaqSection heading="Does my agent read AGENTS.md?" items={faqs.map((f) => ({ q: f.question, a: f.answer }))}>
      <p className="mt-3 mb-0 text-[13px] text-muted">
        Checked against each tool&apos;s docs on <time dateTime={checked}>{formatDay(checked)}</time>.
      </p>
    </FaqSection>
  );
}
