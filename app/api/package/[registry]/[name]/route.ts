import { NextResponse } from "next/server";

import { isRegistry } from "@/lib/clients/registries";
import { lookupPackage } from "@/lib/package-lookup";
import { APP_URL } from "@/lib/version";

export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "public, max-age=3600, s-maxage=3600" };

export async function GET(_req: Request, ctx: { params: Promise<{ registry: string; name: string }> }) {
  const { registry, name } = await ctx.params;

  if (!isRegistry(registry)) {
    return NextResponse.json({ error: "unsupported registry", supported: ["npm", "pypi", "cargo"] }, { status: 400 });
  }

  const result = await lookupPackage(registry, name);

  if (result.status === "scored") {
    return NextResponse.json(
      {
        status: result.status,
        package: result.package,
        registry: result.registry,
        per_model: result.per_model,
        overall: result.repo.overall_score,
        repo: {
          id: result.repo.id,
          host: result.repo.host,
          name: result.repo.name,
          owner: result.repo.owner,
        },
        badge_url: `${APP_URL}/api/badge/${result.repo.host}/${result.repo.owner}/${result.repo.name}.svg`,
      },
      { headers: HEADERS },
    );
  }

  return NextResponse.json(result, { headers: HEADERS });
}
