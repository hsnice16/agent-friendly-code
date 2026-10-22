import { APP_URL } from "./version";

// Inlined wherever an article names its author: Google doesn't resolve an
// @id against another page, so a bare reference reads as an author with no name.
export const AUTHOR_JSON_LD = {
  "@id": `${APP_URL}/about#author`,
  "@type": "Person",
  name: "Himanshu Singh",
  url: "https://github.com/hsnice16",
};
