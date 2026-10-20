export const CONSENT_KEY = "afc:analytics-consent";

// EEA + UK + Switzerland. France's overseas regions are EU territory but
// geolocate under their own codes, so they are listed too. Consent Mode applies `region` by the visitor's IP on
// Google's side, so pages stay static: no geo lookup in a render or the proxy.
export const CONSENT_REGIONS = [
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GF",
  "GP",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MF",
  "MQ",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RE",
  "RO",
  "SE",
  "SI",
  "SK",
  "YT",
];

// Zones inside the consent region that don't start with "Europe/".
const CONSENT_ZONES = new Set([
  "America/Cayenne",
  "America/Guadeloupe",
  "America/Marigot",
  "America/Martinique",
  "Arctic/Longyearbyen",
  "Asia/Famagusta",
  "Asia/Nicosia",
  "Atlantic/Azores",
  "Atlantic/Canary",
  "Atlantic/Madeira",
  "Atlantic/Reykjavik",
  "Indian/Mayotte",
  "Indian/Reunion",
]);

export type ConsentChoice = "granted" | "denied";

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function storeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {}
}

// The banner can't know the IP-based region Google uses, so it approximates
// with the time zone. A miss either way only costs one dismissible bar.
export function inConsentRegion(): boolean {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return zone.startsWith("Europe/") || CONSENT_ZONES.has(zone);
  } catch {
    return false;
  }
}
