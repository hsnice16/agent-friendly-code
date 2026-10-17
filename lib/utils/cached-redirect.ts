import { APP_URL } from "@/lib/version";

const CACHE_CONTROL = "public, max-age=3600, s-maxage=86400";

// A page that redirects is rendered per request and sent `no-store`; a route
// handler's 308 can carry its own Cache-Control, so the CDN answers repeats.
// Vercel's cache is per deployment, so a rescore deploy drops stale targets.
export function cachedRedirect(path: string, request: Request): Response {
  return new Response(null, {
    status: 308,
    headers: { Location: `${path}${new URL(request.url).search}`, "Cache-Control": CACHE_CONTROL },
  });
}

// `notFound()` in a route handler sends an empty 404, and app/not-found.tsx is
// what a visitor typing an unscored repo needs: it leads with Live Score. That
// page is prerendered, so the fetch is a CDN hit. APP_URL, not the request's
// host: a forged Host would otherwise pick the page that gets cached here. A
// preview therefore serves production's copy, whose asset hashes may differ.
export async function notFoundPage(): Promise<Response> {
  try {
    const page = await fetch(new URL("/_not-found", APP_URL));
    const type = page.headers.get("Content-Type") ?? "";
    // Vercel serves the route itself as a 200, `next start` as a 404.
    if ((page.ok || page.status === 404) && type.startsWith("text/html")) {
      return new Response(page.body, {
        status: 404,
        headers: { "Content-Type": type, "Cache-Control": CACHE_CONTROL },
      });
    }
  } catch {
    // Falls through to the bare 404, uncached so the next request retries.
  }

  return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
