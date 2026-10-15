import { APP_NAME } from "@/lib/version";

// Google truncates title links to the device width and snippets near 155
// characters; past these, the end of the text is what searchers never see.
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 155;

export const BRAND_SUFFIX = ` · ${APP_NAME}`;

/**
 * The brand goes last and goes first when space runs out: the result already
 * shows the site name above the title link, so the words of the title are what
 * a truncated title must not lose. `absolute` bypasses the layout template.
 */
export function pageTitle(base: string): { absolute: string } {
  const branded = `${base}${BRAND_SUFFIX}`;
  return { absolute: branded.length <= MAX_TITLE_LENGTH ? branded : base };
}

/**
 * Joins sentences up to `max`; the first always stays. By default it stops at
 * the first that doesn't fit, since later sentences tend to lean on earlier
 * ones. `skip` passes over it instead, for parts that each stand alone.
 */
export function fitSentences(
  [first, ...rest]: string[],
  { max = MAX_DESCRIPTION_LENGTH, skip = false }: { max?: number; skip?: boolean } = {},
): string {
  let out = first;
  for (const s of rest) {
    const next = `${out} ${s}`;
    if (next.length <= max) out = next;
    else if (!skip) break;
  }
  return out;
}

export function fitDescription(first: string, ...rest: string[]): string {
  return fitSentences([first, ...rest]);
}
