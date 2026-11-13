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

export function PanelHeading({ children, tone }: { children: React.ReactNode; tone?: PanelTone }) {
  const toneClass = tone ? TONE_HEADING[tone] : "text-muted";

  return <h2 className={`card-title ${toneClass}`}>{Children.map(children, keepFileCase)}</h2>;
}
