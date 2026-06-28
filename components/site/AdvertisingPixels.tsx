'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

type PixelFunction = (...args: unknown[]) => void

declare global {
  interface Window {
    fbq?: PixelFunction
    ttq?: {
      page?: () => void
    }
    gtag?: PixelFunction
    dataLayer?: unknown[]
  }
}

function cleanPixelId(value?: string) {
  return typeof value === 'string' ? value.trim().replace(/[^A-Za-z0-9_-]/g, '') : ''
}

export function AdvertisingPixels() {
  const pathname = usePathname()
  const initialPathname = useRef(pathname)
  const { trackingPixels } = useSiteSettings()

  const metaPixelId = useMemo(() => cleanPixelId(trackingPixels.metaPixelId), [trackingPixels.metaPixelId])
  const tiktokPixelId = useMemo(() => cleanPixelId(trackingPixels.tiktokPixelId), [trackingPixels.tiktokPixelId])
  const googleAdsId = useMemo(() => cleanPixelId(trackingPixels.googleAdsId).toUpperCase(), [trackingPixels.googleAdsId])

  useEffect(() => {
    if (!pathname || pathname === initialPathname.current) return

    if (metaPixelId && window.fbq) {
      window.fbq('track', 'PageView')
    }

    if (tiktokPixelId && window.ttq?.page) {
      window.ttq.page()
    }

    if (googleAdsId && window.gtag) {
      window.gtag('config', googleAdsId, { page_path: pathname })
    }
  }, [googleAdsId, metaPixelId, pathname, tiktokPixelId])

  return (
    <>
      {metaPixelId && (
        <>
          <Script
            id="jsc-meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', ${JSON.stringify(metaPixelId)});
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {tiktokPixelId && (
        <Script
          id="jsc-tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){var e=ttq._i[t]||[];for(var n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load(${JSON.stringify(tiktokPixelId)});
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {googleAdsId && (
        <>
          <Script
            id="jsc-google-ads-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
          />
          <Script
            id="jsc-google-ads-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(googleAdsId)}, {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  )
}
