import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

type ExternalLinkTone = "dim" | "ink";

const TONE_CLASS: Record<ExternalLinkTone, string> = {
  ink: "border-b border-dotted border-ink-dim/60 text-ink hover:border-ink-soft hover:text-ink-soft",
  dim: "prose-link",
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
      className={`inline-flex items-center gap-0.5 ${TONE_CLASS[tone]}`}
    >
      {children} <ArrowUpRight size={iconSize} weight="bold" aria-hidden="true" />
      <span className="sr-only"> (new tab)</span>
    </a>
  );
}
