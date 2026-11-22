import Link from "next/link";
import type { ReactNode } from "react";

import { plainText } from "@/lib/agents-faq";

import { CodeText } from "./CodeText";
import { FaqList } from "./FaqList";
import { JsonLd } from "./JsonLd";
import { Panel, PanelHeading } from "./Panel";

export type FaqItem = {
  q: string;
  a: string;
  /** Turns one phrase of `a` into a link, so `a` stays the one plain-text source. */
  link?: { phrase: string; href: string };
};

// A phrase that stops matching degrades to plain text, not a crash.
function Answer({ a, link }: FaqItem) {
  const at = link ? a.indexOf(link.phrase) : -1;
  if (!link || at === -1) return <CodeText text={a} />;
  return (
    <>
      <CodeText text={a.slice(0, at)} />
      <Link href={link.href} className="prose-link">
        {link.phrase}
      </Link>
      <CodeText text={a.slice(at + link.phrase.length)} />
    </>
  );
}

// FAQPage markup must match the visible questions word for word, so both are
// built here from one list rather than kept as two copies.
export function FaqSection({ heading, items, children }: { heading: string; items: FaqItem[]; children?: ReactNode }) {
  return (
    <Panel>
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: plainText(f.q),
            acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
          })),
        }}
      />
      <PanelHeading>{heading}</PanelHeading>
      <FaqList items={items.map((f) => ({ key: f.q, q: <CodeText text={f.q} />, a: <Answer {...f} /> }))} />
      {children}
    </Panel>
  );
}
