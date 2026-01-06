import type { PayloadHandler } from 'payload'

export const analyticsScript: PayloadHandler = (req) => {
  const baseURL =
    req.payload.config.serverURL ||
    process.env.PAYLOAD_PUBLIC_URL || new URL(req.url || '').origin

  const js = `
(function () {
  const API = '${baseURL}/api/analytics/track';
  const sendAnalytics = (data) => {
    navigator.sendBeacon(
      API,
      JSON.stringify(data)
    );
  }

  sendAnalytics({
    type: 'pageview',
    path: location.pathname,
    referrer: document.referrer,
    screen: screen.width + 'x' + screen.height,
    lang: navigator.language
    });
    
})();
  `

  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
