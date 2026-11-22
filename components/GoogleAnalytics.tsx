import Script from "next/script";

import { CONSENT_KEY, CONSENT_REGIONS, LEGACY_KEY } from "@/lib/analytics-consent";
import { APP_HOST } from "@/lib/version";

// An inline script ends at the first `</script>`, whatever the JSON says.
const js = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
  // The host check runs in the browser: the same prerendered page is also served by
  // `next start`, previews and local copies, and their visits are not traffic.
  // Consent defaults must be queued before 'config', or the first page view goes out unconsented.
  return (
    <Script id="ga-init" strategy="afterInteractive">{`
      if (location.host === ${js(APP_HOST)}) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(){dataLayer.push(arguments);};
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500,
          region: ${js(CONSENT_REGIONS)}
        });
        gtag('consent', 'default', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
        try {
          var choice = localStorage.getItem(${js(CONSENT_KEY)})
            || (localStorage.getItem(${js(LEGACY_KEY)}) === 'denied' ? 'denied' : null);
          if (choice === 'granted' || choice === 'denied') {
            gtag('consent', 'update', { analytics_storage: choice });
          }
        } catch (e) {}
        gtag('js', new Date());
        gtag('config', ${js(id)});
        var tag = document.createElement('script');
        tag.async = true;
        tag.src = ${js(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`)};
        document.head.appendChild(tag);
      }
    `}</Script>
  );
}
