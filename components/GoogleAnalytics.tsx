import Script from "next/script";

/** Loads nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set. */
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
        gtag('config', ${JSON.stringify(id)});
      `}</Script>
    </>
  );
}
