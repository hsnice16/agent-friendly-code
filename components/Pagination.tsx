import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { MouseEvent } from "react";

type Props = {
  page: number;
  label?: string;
  totalPages: number;
  hrefFor: (page: number) => string;
  size?: "default" | "compact";
  /** Called before the link is followed; it may `preventDefault` to page in place. */
  onPageClick?: (page: number, e: MouseEvent) => void;
};

const BASE_DEFAULT =
  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium max-sm:min-h-[44px]";
const BASE_COMPACT =
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[13px] font-medium max-sm:min-h-[44px]";

const ACTIVE = "border-line bg-surface text-ink-dim hover:text-ink-soft";
const DISABLED = "cursor-not-allowed border-line/60 bg-transparent text-muted/60";

export function Pagination({ page, hrefFor, totalPages, label = "Pages", size = "default", onPageClick }: Props) {
  const iconSize = 12;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const BASE = size === "compact" ? BASE_COMPACT : BASE_DEFAULT;

  const Prev = canPrev ? (
    <Link
      rel="prev"
      scroll={!onPageClick}
      href={hrefFor(page - 1)}
      className={`${BASE} ${ACTIVE}`}
      onClick={onPageClick && ((e) => onPageClick(page - 1, e))}
    >
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
    <Link
      rel="next"
      scroll={!onPageClick}
      href={hrefFor(page + 1)}
      className={`${BASE} ${ACTIVE}`}
      onClick={onPageClick && ((e) => onPageClick(page + 1, e))}
    >
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
