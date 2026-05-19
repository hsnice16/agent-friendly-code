import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export type ExternalLinkTone = "dim" | "ink";

const TONE_TEXT: Record<ExternalLinkTone, string> = {
  ink: "text-ink",
  dim: "text-ink-dim",
};

type ExternalLinkProps = {
  href: string;
  title?: string;
  iconSize?: 11 | 12;
  tone?: ExternalLinkTone;
  children: React.ReactNode;
};

export function ExternalLink({ href, title, children, tone = "dim", iconSize = 11 }: ExternalLinkProps) {
  return (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-0.5 border-b border-dotted border-ink-dim/60 ${TONE_TEXT[tone]} hover:border-ink-soft hover:text-ink-soft`}
    >
      {children} <ArrowUpRight size={iconSize} weight="bold" aria-hidden="true" />
    </a>
  );
}
