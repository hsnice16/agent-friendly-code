import { AlternativesStripView, type Props } from "./AlternativesStripView";

/** Rows are cut to what the strip renders: a topic match arrives as a whole board row. */
export function AlternativesStrip({ alternatives, ...rest }: Props) {
  const rows = alternatives.map((a) => ({
    id: a.id,
    host: a.host,
    owner: a.owner,
    name: a.name,
    score: a.score,
    stars: a.stars,
    ...("language" in a ? { language: a.language } : {}),
    ...(a.detail !== undefined ? { detail: a.detail } : {}),
  }));

  return <AlternativesStripView alternatives={rows} {...rest} />;
}
