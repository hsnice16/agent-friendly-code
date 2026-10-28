import { inConsentRegion, readConsent } from "./analytics-consent";

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

const PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const GRANTED = { ad_Storage: "denied", analytics_Storage: "granted" };

// Stricter than GA, which loads for everyone and lets Consent Mode decide by IP:
// recordings are more than a visit count, so a visitor the banner would ask gets
// no script at all until they accept. Clarity's own IP check still applies on
// top, keeping a visitor whose time zone hides their region cookieless.
export function clarityAllowed(): boolean {
  const choice = readConsent();
  if (choice !== null) return choice === "granted";
  return !inConsentRegion();
}

export function startClarity(): void {
  if (!PROJECT_ID) return;
  // Already loaded (no-consent visit, or a decline earlier on this page): only
  // the consent signal is missing.
  if (window.clarity) {
    if (readConsent() === "granted") window.clarity("consentv2", GRANTED);
    return;
  }
  // Microsoft's install snippet: calls made before the tag arrives queue on `q`.
  const clarity: ClarityFn = (...args) => {
    clarity.q = clarity.q ?? [];
    clarity.q.push(args);
  };
  window.clarity = clarity;
  if (readConsent() === "granted") clarity("consentv2", GRANTED);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(PROJECT_ID)}`;
  document.head.appendChild(script);
}

// Clarity removes its cookies and records the rest of this page view without
// them; Microsoft documents no call that ends a recording mid-page.
export function stopClarity(): void {
  window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
}
