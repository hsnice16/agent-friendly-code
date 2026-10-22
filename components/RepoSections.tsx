import { FloatingSectionMenu, type NavSection, SectionNav } from "@/components/SectionNav";

// scroll-mt clears the sticky header when a nav link jumps here.
export function Section({
  id,
  className = "",
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`mt-3.5 scroll-mt-20 ${className}`}>
      {children}
    </section>
  );
}

/** Place inside a `relative` wrapper that spans the sections. */
export function SectionRail({
  sections,
  action,
}: {
  sections: NavSection[];
  /** Rendered once per layout, so it must not rely on being unique in the DOM. */
  action?: (align: "start" | "end") => React.ReactNode;
}) {
  return (
    <>
      {/* In the page margin, beside the content rather than taking width from
        it; below that width the margin is too narrow, so the menu floats. */}
      <div className="absolute inset-y-0 left-full ml-10 hidden w-44 min-[1600px]:block">
        <SectionNav sections={sections} action={action?.("start")} />
      </div>
      <div className="min-[1600px]:hidden">
        <FloatingSectionMenu sections={sections} action={action?.("end")} />
      </div>
    </>
  );
}
