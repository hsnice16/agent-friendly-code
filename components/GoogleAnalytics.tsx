import Script from "next/script";

import { CONSENT_KEY, CONSENT_REGIONS, LEGACY_KEY } from "@/lib/analytics-consent";

/** Loads nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set. */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />

      {/* Consent defaults must be queued before 'config', or the first page view goes out unconsented. */}
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500,
          region: ${JSON.stringify(CONSENT_REGIONS)}
        });
        gtag('consent', 'default', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
        try {
          var choice = localStorage.getItem(${JSON.stringify(CONSENT_KEY)})
            || (localStorage.getItem(${JSON.stringify(LEGACY_KEY)}) === 'denied' ? 'denied' : null);
          if (choice === 'granted' || choice === 'denied') {
            gtag('consent', 'update', { analytics_storage: choice });
          }
        } catch (e) {}
        gtag('js', new Date());
        gtag('config', ${JSON.stringify(id)});
      `}</Script>
    </>
  );
}
