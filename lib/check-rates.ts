import { fullRate, getCheckStats } from "./check-stats";
import type { SignalResult } from "./scoring/signals";
import { languageSlug } from "./utils/language";
import type { CheckRates } from "./utils/repo-report";

export function checkRates(signals: SignalResult[], languageOfRepo: string | null): CheckRates {
  const slug = languageOfRepo ? languageSlug(languageOfRepo) : null;
  return Object.fromEntries(
    signals.map((s) => {
      const stats = getCheckStats(s.id);
      const inLanguage = stats.languages.find((l) => l.slug === slug);
      return [s.id, { all: fullRate(stats), language: inLanguage ? fullRate(inLanguage.counts) : null }];
    }),
  );
}
