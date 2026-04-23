export function Panel({
  children,
  className = "",
  padding = true,
}: {
  padding?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-line bg-surface ${padding ? "px-5 py-5" : ""} ${className}`}>
      {children}
    </section>
  );
}

export function PanelHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">{children}</h3>;
}
