"use client";

import { useEffect } from "react";

import { clarityAllowed, startClarity } from "@/lib/clarity";

/** ConsentBanner starts it on Accept; this covers every other visit. */
export function Clarity() {
  useEffect(() => {
    if (clarityAllowed()) startClarity();
  }, []);
  return null;
}
