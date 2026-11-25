import { CodeText } from "./CodeText";
import { ExternalLink } from "./ExternalLink";
import { IntentLink } from "./IntentLink";

// Only absolute https or site paths, so copy can't smuggle in a javascript: URL.
// `//host` and `/\host` are other origins to a browser, so a second slash is refused.
const LINK = /\[([^\]]+)\]\(((?:https:\/\/|\/(?![/\\]))[^)\s]+)\)/g;

function linked(text: string, key: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const [whole, label, href] = m;
    parts.push(text.slice(last, m.index));
    parts.push(
      href.startsWith("/") ? (
        <IntentLink key={`${key}-${m.index}`} href={href} className="prose-link">
          {label}
        </IntentLink>
      ) : (
        <ExternalLink key={`${key}-${m.index}`} href={href} title={href}>
          {label}
        </ExternalLink>
      ),
    );
    last = m.index + whole.length;
  }
  parts.push(text.slice(last));
  return parts;
}

/** CodeText plus `[label](url)` links, so a fact can cite the page that states it. Inside a code span, link syntax stays text. */
export function LinkedText({ text }: { text: string }) {
  return text.split("`").flatMap((part, i): React.ReactNode[] =>
    // biome-ignore lint/suspicious/noArrayIndexKey: a static string's parts never reorder
    i % 2 === 1 ? [<CodeText key={`c${i}`} text={`\`${part}\``} />] : linked(part, i),
  );
}
