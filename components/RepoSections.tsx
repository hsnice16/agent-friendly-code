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
export function SectionRail({ sections }: { sections: NavSection[] }) {
  return (
    <>
      {/* In the page margin, beside the content rather than taking width from
        it; below that width the margin is too narrow, so the menu floats. */}
      <div className="absolute inset-y-0 left-full ml-10 hidden w-44 min-[1500px]:block">
        <SectionNav sections={sections} />
      </div>
      <div className="min-[1500px]:hidden">
        <FloatingSectionMenu sections={sections} />
      </div>
    </>
  );
}
