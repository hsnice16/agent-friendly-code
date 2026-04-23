import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

type Props = {
  page: number;
  label?: string;
  totalPages: number;
  hrefFor: (page: number) => string;
  /** "default" — bottom of list; "compact" — inline toolbar. Both share the 13px chrome size. */
  size?: "default" | "compact";
};

const BASE_DEFAULT = "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium";
const BASE_COMPACT = "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[13px] font-medium";

const ACTIVE = "border-line bg-surface text-ink-dim hover:text-ink-soft";
const DISABLED = "cursor-not-allowed border-line/60 bg-transparent text-muted/60";

export function Pagination({ page, hrefFor, totalPages, label = "Pages", size = "default" }: Props) {
  const iconSize = 12;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const BASE = size === "compact" ? BASE_COMPACT : BASE_DEFAULT;

  const Prev = canPrev ? (
    <Link href={hrefFor(page - 1)} rel="prev" className={`${BASE} ${ACTIVE}`}>
      <ArrowLeft size={iconSize} aria-hidden="true" />
      <span>Prev</span>
    </Link>
  ) : (
    <span aria-disabled="true" className={`${BASE} ${DISABLED}`}>
      <ArrowLeft size={iconSize} aria-hidden="true" />
      <span>Prev</span>
    </span>
  );

  const Next = canNext ? (
    <Link href={hrefFor(page + 1)} rel="next" className={`${BASE} ${ACTIVE}`}>
      <span>Next</span>
      <ArrowRight size={iconSize} aria-hidden="true" />
    </Link>
  ) : (
    <span aria-disabled="true" className={`${BASE} ${DISABLED}`}>
      <span>Next</span>
      <ArrowRight size={iconSize} aria-hidden="true" />
    </span>
  );

  return (
    <nav aria-label={label} className="flex items-center gap-2">
      {Prev}

      <span className="text-[13px] tabular-nums text-muted">
        {page} / {totalPages}
      </span>
      {Next}
    </nav>
  );
}
