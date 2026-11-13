/**
 * The last section whose top has passed `line`, or the last one once the page
 * can scroll no further: a short final section never reaches the line, so it
 * would never light while it sits fully in view.
 */
export function activeSectionId(
  sections: { id: string; top: number | null }[],
  line: number,
  atBottom: boolean,
): string | null {
  const present = sections.filter((s) => s.top != null);
  if (atBottom && present.length > 0) return present[present.length - 1].id;
  let current: string | null = null;
  for (const s of present) {
    if ((s.top as number) <= line) current = s.id;
  }
  return current ?? sections[0]?.id ?? null;
}
