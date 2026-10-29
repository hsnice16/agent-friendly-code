// Board data ships inside the deployment and a deploy starts an empty CDN
// cache, so a day-long CDN copy can't outlive the data it was built from.
export const BOARD_CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

// Live scores and registry lookups change without a deploy.
export const LIVE_CACHE_CONTROL = "public, max-age=3600, s-maxage=3600";
