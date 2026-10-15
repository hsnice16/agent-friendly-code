import { ImageResponse } from "next/og";

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

export const OG_MUTED = "#525252";
export const OG_FOOTER = {
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
export function OgFrame({ children }: { children: React.ReactNode }) {
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
