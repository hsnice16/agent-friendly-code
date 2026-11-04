type PanelTone = "warn" | "info" | "tip";

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
  const cls = ["rounded-xl border bg-surface", borderClass, padding && "p-5", className].filter(Boolean).join(" ");

  return <section className={cls}>{children}</section>;
}

export function PanelHeading({ children, tone }: { children: React.ReactNode; tone?: PanelTone }) {
  const toneClass = tone ? TONE_HEADING[tone] : "text-muted";

  return <h2 className={`mb-3.5 text-xs eyebrow ${toneClass}`}>{children}</h2>;
}
