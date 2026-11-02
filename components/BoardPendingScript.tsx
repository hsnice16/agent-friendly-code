import { HOSTS } from "@/lib/constants/hosts";
import { DEFAULT_DIR, DEFAULT_SORT } from "@/lib/constants/sort";

const OTHER_SORT = DEFAULT_SORT === "score" ? "stars" : "score";
const OTHER_DIR = DEFAULT_DIR === "desc" ? "asc" : "desc";

// A link to a re-cut board (search, filter, sort, or a page the path doesn't
// name) must not flash the prerendered default order: this marks <html>
// while the HTML is still parsing, globals.css shows placeholders, and
// BoardClient clears the mark once it has the rows. It mirrors isRecut and
// BoardClient's page check, so defaults and unknown values don't trigger it.
// In <head> of the root layout, which client navigation never re-renders;
// there BoardClient sets the mark itself.
export const BOARD_PENDING_SCRIPT = `(function(){var l=location,b=/^\\/(model\\/[^/]+\\/?)?(page\\/\\d+)?$/,p=new URLSearchParams(l.search),m=/\\/page\\/(\\d+)$/.exec(l.pathname),n=Math.floor(Number(p.get("page")));if(!b.test(l.pathname))return;if((p.get("q")||"").trim()||${JSON.stringify(HOSTS)}.indexOf(p.get("host"))>=0||p.get("sort")===${JSON.stringify(OTHER_SORT)}||p.get("dir")===${JSON.stringify(OTHER_DIR)}||(p.has("page")&&n>=1&&n!==(m?Number(m[1]):1)))document.documentElement.setAttribute("data-board-pending","")})()`;

export function BoardPendingScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string built from constants, no input
  return <script dangerouslySetInnerHTML={{ __html: BOARD_PENDING_SCRIPT }} />;
}
