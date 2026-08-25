import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/version";

export const contentType = "image/png";
export const alt = `${APP_NAME} — Live Score: any public GitHub repo, on demand`;
export const size = { width: 1200, height: 630 };

export default function Image() {
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
        <div style={{ display: "flex", fontWeight: 700, fontSize: "70px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          Live Score
        </div>

        <div style={{ display: "flex", marginTop: "28px", fontSize: "30px", color: "#525252", lineHeight: 1.35 }}>
          Paste a public GitHub URL — scored from its current commit, per model.
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", fontSize: "24px", color: "#525252" }}>
        <div style={{ display: "flex" }}>agentfriendlycode.com/score</div>
      </div>
    </div>,
    size,
  );
}
