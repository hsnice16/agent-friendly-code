import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/version";

// The Organization logo in lib/site-json-ld.ts: Google wants a raster image of at least
// 112x112, so icon.svg can't serve. Same mark and light-scheme colours as app/icon.svg.
export const dynamic = "force-static";

const SIZE = 512;
const MARK =
  "M11.2 23.5 L14.8 8.5 L17.2 8.5 L20.8 23.5 L18.2 23.5 L17.35 19.8 L14.65 19.8 L13.8 23.5 Z M15.1 17.7 L16.9 17.7 L16 13.8 Z";
const BG = "#0a0a0a";
const FG = "#ffffff";

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      <svg viewBox="0 0 32 32" width={SIZE} height={SIZE} role="img" aria-label={APP_NAME}>
        <rect width="32" height="32" rx="6" fill={BG} />
        <path d={MARK} fill={FG} />
      </svg>
    </div>,
    { width: SIZE, height: SIZE },
  );
}
