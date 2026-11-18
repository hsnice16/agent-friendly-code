import { Children } from "react";

type PanelTone = "warn" | "info" | "tip";

// One meaning each: tip for the thing to do, info for an optional aside, warn
// only for a caveat. Emphasis alone gets no tone.
const TONE_BORDER: Record<PanelTone, string> = {
  tip: "border-tip/40",
  info: "border-info/40",
  warn: "border-warn/40",
};

const TONE_HEADING: Record<PanelTone, string> = {
  tip: "text-tip",
  info: "text-info",
  warn: "text-warn",
};

// Card titles and table headers uppercase, and "AGENTS.MD" or "NEXT.JS" reads as another
// name. A repo slug in a title is wrapped by its caller.
const FILE_NAME = /(\.?[\w.-]+(?:\/[\w.*-]+)*\.(?:md|mdc|ya?ml|json|sh|toml|js|ts)\b|\.[\w-]+\/[\w./*-]+)/;

export function keepFileCase(node: React.ReactNode): React.ReactNode {
  if (typeof node !== "string") return node;
  return node.split(FILE_NAME).map((part, i) =>
    i % 2 === 1 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: a string's parts never reorder
      <span key={i} className="normal-case">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function Panel({
  tone,
  children,
  className = "",
  padding = true,
}: {
  tone?: PanelTone;
  padding?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const borderClass = tone ? TONE_BORDER[tone] : "border-line";
  const cls = ["card", borderClass, padding && "p-5", className].filter(Boolean).join(" ");

  return <section className={cls}>{children}</section>;
}

// Whole class names: Tailwind only generates a utility it finds spelled out in the source.
const ICON_CLASS = {
  download: "icon-download",
  play: "icon-play",
  "text-aa": "icon-text-aa",
  search: "icon-search",
  wrench: "icon-wrench",
  robot: "icon-robot",
  "book-open": "icon-book-open",
  merge: "icon-merge",
  "list-checks": "icon-list-checks",
  package: "icon-package",
  "pull-request": "icon-pull-request",
  puzzle: "icon-puzzle",
  ruler: "icon-ruler",
  flask: "icon-flask",
  "file-text": "icon-file-text",
} as const;

export type PanelIcon = keyof typeof ICON_CLASS;

const TONE_GLYPH: Record<PanelTone, string> = {
  tip: "bg-tip/10 text-tip",
  info: "bg-info/10 text-info",
  warn: "bg-warn/10 text-warn",
};

export function PanelHeading({
  children,
  tone,
  icon,
}: {
  children: React.ReactNode;
  tone?: PanelTone;
  icon?: PanelIcon;
}) {
  const toneClass = tone ? TONE_HEADING[tone] : "text-muted";
  const text = Children.map(children, keepFileCase);

  if (!icon) {
    return <h2 className={`card-title ${toneClass}`}>{text}</h2>;
  }

  return (
    <h2 className={`card-title flex items-center gap-2.5 ${toneClass}`}>
      <span aria-hidden="true" className={`glyph size-7 ${TONE_GLYPH[tone ?? "tip"]}`}>
        <span className={ICON_CLASS[icon]} />
      </span>
      <span className="min-w-0">{text}</span>
    </h2>
  );
}
