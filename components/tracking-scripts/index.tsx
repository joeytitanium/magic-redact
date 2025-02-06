import Script from 'next/script';

export const GOOGLE_TAG_MANAGER_ID = 'AW-XXX';

export const HeadTrackingScripts = () => <></>;

export const PostHeadTrackingScripts = () => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_MANAGER_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GOOGLE_TAG_MANAGER_ID}', {
          'allow_enhanced_conversions': true
        });
    `}
    </Script>
  </>
);
