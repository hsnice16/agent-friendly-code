import { type NextRequest, NextResponse } from "next/server";

import { hubPath, languageSlug } from "@/lib/utils/language";

// `/language/TypeScript` and `/language/C++` are what people type. Redirected
// here rather than in the page: hubs are prerendered, and a redirect rendered on
// demand for each spelling would be cached as one more page per spelling.
export function proxy(request: NextRequest) {
  const [slug, ...rest] = request.nextUrl.pathname.slice("/language/".length).split("/");
  const suffix = rest.length > 0 ? `/${rest.join("/")}` : "";

  let canonical: string;
  try {
    canonical = languageSlug(decodeURIComponent(slug));
  } catch {
    return NextResponse.next();
  }

  if (!canonical || canonical === slug) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `${hubPath(canonical)}${suffix}`;
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ["/language/:slug", "/language/:slug/agents"] };
