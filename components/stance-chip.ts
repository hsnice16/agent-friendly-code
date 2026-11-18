import type { Stance } from "@/lib/ai-policy";

// Shared by the server chip and the client table; a value exported from a "use client"
// module reaches the server as a client reference, not the object.
export const STANCE_CHIP: Record<Stance, string> = {
  bans: "border-bad/40 bg-bad/10 text-bad",
  restricts: "border-warn/40 bg-warn/10 text-warn",
  // No tint: text-info on bg-info/10 is 4.3:1 in light mode, under AA for text this small.
  disclose: "border-info/40 text-info",
  allows: "border-line bg-surface-2 text-muted",
  welcomes: "border-ok/40 bg-ok/10 text-ok",
};
