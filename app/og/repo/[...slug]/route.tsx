import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { getRepoByHostOwnerName } from "@/lib/db";
import { OG_FOOTER, OG_MUTED, OgFrame } from "@/lib/og-card";
import { MODELS } from "@/lib/scoring/weights";
import { hostLabel } from "@/lib/utils/format";
import { repoIdentity } from "@/lib/utils/repo-path";
import { OG_IMAGE_SIZE } from "@/lib/version";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const identity = repoIdentity((await params).slug);

  const repo = identity ? getRepoByHostOwnerName(identity.host, identity.owner, identity.name) : null;
  if (!repo) {
    notFound();
  }

  const slug = `${repo.owner}/${repo.name}`;
  const score = repo.overall_score != null ? repo.overall_score.toFixed(1) : "—";
  const host = hostLabel(repo.host);

  return new ImageResponse(
    <OgFrame>
      <div style={{ flex: 1, display: "flex", marginTop: "32px", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", fontWeight: 700, fontSize: "78px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {slug}
        </div>
        <div style={{ display: "flex", color: OG_MUTED, fontSize: "30px", marginTop: "16px" }}>
          Agent-friendliness score{host ? ` · ${host}` : ""}
          {repo.language ? ` · ${repo.language}` : ""}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "20px" }}>
        <div style={{ lineHeight: 1, display: "flex", fontWeight: 700, fontSize: "192px", letterSpacing: "-0.04em" }}>
          {score}
        </div>
        <div style={{ display: "flex", color: OG_MUTED, fontSize: "48px" }}>/ 100</div>
      </div>

      {/* 20px, not the footer's 22: the full agent labels have to fit one line at 1040px. */}
      <div style={{ ...OG_FOOTER, fontSize: "20px", marginTop: "32px" }}>{MODELS.map((m) => m.label).join(" · ")}</div>
    </OgFrame>,
    { ...OG_IMAGE_SIZE },
  );
}
