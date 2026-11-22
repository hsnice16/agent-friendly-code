import { APP_URL } from "./version";

export const AUTHOR_NAME = "Himanshu Singh";

// Inlined wherever an article names its author: Google doesn't resolve an
// @id against another page, so a bare reference reads as an author with no name.
export const AUTHOR_JSON_LD = {
  "@id": `${APP_URL}/about#author`,
  "@type": "Person",
  name: AUTHOR_NAME,
  url: "https://github.com/hsnice16",
};
