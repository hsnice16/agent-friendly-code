import {
  ACTION_REPO_URL,
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  REPO_URL,
  SKILL_LISTING_URL,
  SKILL_REPO_URL,
} from "./version";

const ACTION_MARKETPLACE_URL = "https://github.com/marketplace/actions/agent-friendly-score-diff";

const ORG_ID = `${APP_URL}/#org`;
// For a node in the home page graph, which carries the full Organization.
export const ORG_REF = { "@id": ORG_ID };
const SITE_ID = `${APP_URL}/#site`;

/**
 * Only the home page carries these: in the root layout they added ~1.2 KB to
 * every page, twice (markup and RSC payload), and payload bytes are billed ISR reads.
 */
export const SITE_JSON_LD_NODES: Record<string, unknown>[] = [
  {
    "@type": "Organization",
    "@id": ORG_ID,
    url: APP_URL,
    name: APP_NAME,
    sameAs: [REPO_URL, ACTION_REPO_URL, SKILL_REPO_URL, ACTION_MARKETPLACE_URL, SKILL_LISTING_URL],
    logo: `${APP_URL}/logo.png`,
  },
  {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: APP_URL,
    name: APP_NAME,
    description: APP_DESCRIPTION,
    publisher: ORG_REF,
  },
  {
    "@type": "WebApplication",
    "@id": `${APP_URL}/#app`,
    url: APP_URL,
    name: APP_NAME,
    operatingSystem: "Any",
    isAccessibleForFree: true,
    description: APP_DESCRIPTION,
    publisher: ORG_REF,
    applicationCategory: "DeveloperApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    browserRequirements: "Requires JavaScript-enabled modern browser",
  },
];

// Named in full on other pages: Google doesn't resolve an @id against another page.
export const PUBLISHER_JSON_LD = { "@type": "Organization", "@id": ORG_ID, name: APP_NAME, url: APP_URL };
export const WEBSITE_JSON_LD = { "@type": "WebSite", "@id": SITE_ID, name: APP_NAME, url: APP_URL };
