type ExternalLinkTone = "dim" | "ink";

const TONE_CLASS: Record<ExternalLinkTone, string> = {
  ink: "font-medium ink-link",
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
      className={`out-link max-w-full [overflow-wrap:anywhere] ${TONE_CLASS[tone]}`}
    >
      {children} {/* May shrink: in a narrow table cell a fixed-width arrow pushes long URLs onto an extra line. */}
      <span aria-hidden="true" className={iconSize === 12 ? "icon-out shrink [--icon-size:12px]" : "icon-out shrink"} />
      <span className="sr-only"> (new tab)</span>
    </a>
  );
}
