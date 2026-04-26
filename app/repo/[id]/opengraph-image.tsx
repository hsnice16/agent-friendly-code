import { ImageResponse } from "next/og";

import { getRepo } from "@/lib/db";
import { hostLabel } from "@/lib/utils/format";
import { APP_NAME } from "@/lib/version";

export const contentType = "image/png";
export const alt = "Agent-friendliness score";
export const size = { width: 1200, height: 630 };

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);

  const repo = Number.isFinite(id) ? getRepo(id) : null;
  const slug = repo ? `${repo.owner}/${repo.name}` : "Unknown repo";
  const score = repo?.overall_score != null ? repo.overall_score.toFixed(1) : "—";
  const host = repo ? hostLabel(repo.host) : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        color: "#0a0a0a",
        padding: "72px 80px",
        background: "#ffffff",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#525252", fontSize: "26px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            display: "flex",
            fontWeight: 700,
            fontSize: "24px",
            color: "#ffffff",
            alignItems: "center",
            borderRadius: "10px",
            background: "#0a0a0a",
            justifyContent: "center",
          }}
        >
          A
        </div>
        <div style={{ display: "flex" }}>{APP_NAME}</div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          marginTop: "32px",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontWeight: 700,
            fontSize: "78px",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {slug}
        </div>
        <div style={{ display: "flex", color: "#525252", fontSize: "30px", marginTop: "16px" }}>
          Agent-friendliness score{host ? ` · ${host}` : ""}
          {repo?.language ? ` · ${repo.language}` : ""}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "20px" }}>
        <div
          style={{
            lineHeight: 1,
            display: "flex",
            fontWeight: 700,
            fontSize: "192px",
            letterSpacing: "-0.04em",
          }}
        >
          {score}
        </div>
        <div style={{ display: "flex", color: "#525252", fontSize: "48px" }}>/ 100</div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: "22px",
          marginTop: "32px",
          color: "#737373",
          paddingTop: "24px",
          borderTop: "1px solid #e5e5e5",
        }}
      >
        Claude Code · Cursor · Devin · Codex · Gemini · Aider · OpenHands · Pi
      </div>
    </div>,
    { ...size },
  );
}
