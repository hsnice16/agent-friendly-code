import { type NextRequest, NextResponse } from "next/server";

import { languageRedirect } from "@/lib/utils/language";

// `/language/TypeScript` and `/language/C++` are what people type. Redirected
// here rather than in the page: hubs are prerendered, and a redirect rendered on
// demand for each spelling would be cached as one more page per spelling.
export function proxy(request: NextRequest) {
  const target = languageRedirect(request.nextUrl.pathname);
  if (!target) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = target.pathname;
  url.hash = target.hash;
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ["/language/:slug", "/language/:slug/agents"] };
