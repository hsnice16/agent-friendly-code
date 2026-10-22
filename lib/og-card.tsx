import { ImageResponse } from "next/og";

import { MODELS } from "@/lib/scoring/weights";
import { APP_HOST, APP_NAME, OG_IMAGE_SIZE } from "@/lib/version";

type OgCard = {
  /** One entry per line; satori does not balance wrapped headline text. */
  heading: string[];
  sub: string;
  footerLeft?: string;
  footerRight: string;
  headingSize?: number;
};

const LINE = { display: "flex", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em" } as const;

const OG_MUTED = "#525252";
const OG_FOOTER = {
  display: "flex",
  fontSize: "22px",
  color: "#737373",
  paddingTop: "24px",
  borderTop: "1px solid #e5e5e5",
} as const;

/** A path on this site as a card footer prints it: host and path, no scheme. */
export function ogSiteUrl(path = ""): string {
  return `${APP_HOST}${path}`;
}

/** The page and brand row every share card starts with; `children` fill the rest of the column. */
function OgFrame({ children }: { children: React.ReactNode }) {
  return (
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
      <div style={{ display: "flex", alignItems: "center", gap: "16px", color: OG_MUTED, fontSize: "26px" }}>
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
      {children}
    </div>
  );
}

/** The house share-card layout: brand row, headline, one line of context, footer. */
export function ogCard({ heading, sub, footerLeft, footerRight, headingSize = 70 }: OgCard): ImageResponse {
  return new ImageResponse(
    <OgFrame>
      <div style={{ flex: 1, display: "flex", marginTop: "32px", flexDirection: "column", justifyContent: "center" }}>
        {heading.map((line) => (
          <div key={line} style={{ ...LINE, fontSize: `${headingSize}px` }}>
            {line}
          </div>
        ))}
        <div
          style={{
            display: "flex",
            color: OG_MUTED,
            fontSize: "28px",
            marginTop: "24px",
            maxWidth: "1000px",
            lineHeight: 1.35,
          }}
        >
          {sub}
        </div>
      </div>

      <div style={{ ...OG_FOOTER, alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ display: "flex" }}>{footerLeft ?? ""}</div>
        <div style={{ display: "flex" }}>{footerRight}</div>
      </div>
    </OgFrame>,
    { ...OG_IMAGE_SIZE },
  );
}

type RepoScoreCard = {
  slug: string;
  /** Printed as is; "—" when the repo has no score. */
  score: string;
  /** Host label and language, joined into the line under the name. */
  context: (string | null)[];
};

/** A repo's share card: its name, its overall score, and the agents it is scored for. */
export function repoScoreCard({ slug, score, context }: RepoScoreCard): ImageResponse {
  return new ImageResponse(
    <OgFrame>
      <div style={{ flex: 1, display: "flex", marginTop: "32px", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", fontWeight: 700, fontSize: "78px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {slug}
        </div>
        <div style={{ display: "flex", color: OG_MUTED, fontSize: "30px", marginTop: "16px" }}>
          {["Agent-friendliness score", ...context.filter(Boolean)].join(" · ")}
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
