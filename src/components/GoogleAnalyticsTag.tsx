import Script from 'next/script';

/**
 * GA4 tag (gtag.js), the same thing @next/third-parties' GoogleAnalytics renders. That component doesn't render
 * under vinext on Cloudflare (it resolves to undefined there and fails the whole page), so the tag is written here.
 */
export default function GoogleAnalyticsTag({ gaId }: { gaId: string }) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  );
}
