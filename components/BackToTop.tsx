"use client";

import { ArrowUp } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight > window.innerHeight + 200;

      const nearBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 300;
      setVisible(scrollable && nearBottom);
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <button
      type="button"
      aria-hidden={!visible}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0 })}
      className={`fixed bottom-6 right-6 z-30 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink-dim shadow-sm hover:bg-surface-hover hover:text-ink-soft ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUp size={18} weight="bold" aria-hidden="true" />
    </button>
  );
}
