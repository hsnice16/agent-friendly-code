"use client";

import "./globals.css";

// Shown only when the root layout itself throws, so it renders its own document.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>Something went wrong</title>
        <main className="mx-auto max-w-[1080px] px-3 py-10 sm:px-6">
          <h1 className="m-0 text-[19px] font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-2 max-w-[64ch] text-[14.5px] text-ink-dim">
            It was our error, not something you did. Trying again usually works.
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={retry}
              className="cursor-pointer rounded-lg border border-line bg-ink px-4 py-2 text-[14px] font-medium text-accent-ink hover:bg-ink-soft"
            >
              Try again
            </button>
            {/* A full load, not <Link>: client navigation would reuse the layout that just threw. */}
            <a href="/" className="text-[14px] text-ink-dim hover:text-ink">
              ← back to the leaderboard
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
