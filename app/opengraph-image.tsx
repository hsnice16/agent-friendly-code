import { ImageResponse } from "next/og";

import { getLeaderboardStats } from "@/lib/db";
import { APP_NAME } from "@/lib/version";

export const contentType = "image/png";
export const alt = `${APP_NAME} — public agent-friendliness leaderboard`;
export const size = { width: 1200, height: 630 };

export default function Image() {
  const stats = getLeaderboardStats();

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
            fontSize: "70px",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Which public repos are
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 700,
            fontSize: "70px",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          friendliest to AI coding agents?
        </div>
        <div style={{ display: "flex", color: "#525252", fontSize: "28px", marginTop: "24px", maxWidth: "1000px" }}>
          Per-model leaderboard across GitHub, GitLab, and Bitbucket — ranked for Claude Code, Cursor, Devin, Codex,
          Gemini, Aider, OpenHands, and Pi.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: "22px",
          color: "#737373",
          paddingTop: "24px",
          alignItems: "baseline",
          justifyContent: "space-between",
          borderTop: "1px solid #e5e5e5",
        }}
      >
        <div style={{ display: "flex" }}>
          {stats.count > 0 ? `${stats.count} repos scored · per-model` : "Per-model · static heuristics"}
        </div>
        <div style={{ display: "flex" }}>agentfriendlycode.com</div>
      </div>
    </div>,
    { ...size },
  );
}
