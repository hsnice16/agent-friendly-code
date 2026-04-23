import Script from "next/script";

/**
 * GA4 tag, gated on the NEXT_PUBLIC_GA_MEASUREMENT_ID env var.
 * Set it in `.env.local` (gitignored) — e.g. `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`.
 * Nothing is loaded when the env var is absent.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;
  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />

      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${id}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}
