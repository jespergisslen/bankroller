// Canonical production origin. Override with NEXT_PUBLIC_SITE_URL when the
// custom domain (bankroller.bet) goes live — used for canonical tags, sitemap,
// robots and absolute OG URLs.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://bankroller.vercel.app"
).replace(/\/$/, "");
