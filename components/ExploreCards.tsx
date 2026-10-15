import Link from "next/link";

type Card = { title: string; count: number; href: string; items: { label: string; href: string }[] };

export function ExploreCards({ cards }: { cards: (Card | false)[] }) {
  const shown = cards.filter((c): c is Card => Boolean(c));

  return (
    <nav aria-label="Explore" className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {shown.map((c) => (
        <div key={c.title} className="rounded-xl border border-line bg-surface px-4 py-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <Link href={c.href} className="text-[14px] font-semibold text-ink hover:text-ink-soft">
              {c.title}
            </Link>
            <span className="text-[12px] text-muted">{c.count}</span>
          </div>
          <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-muted">
            {c.items.map((i, n) => (
              <span key={i.href}>
                {n > 0 && " · "}
                <Link href={i.href} className="text-ink-dim hover:text-ink-soft">
                  {i.label}
                </Link>
              </span>
            ))}
          </p>
          <Link href={c.href} className="mt-2 inline-block text-[12.5px] text-ink-dim hover:text-ink-soft">
            See all {c.count} →
          </Link>
        </div>
      ))}
    </nav>
  );
}
