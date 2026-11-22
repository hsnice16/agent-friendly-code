import type { SignalResult } from "@/lib/scoring/signals/types";

import { type RepoLocation, SignalRowsView } from "./SignalRowsView";

/** With `repo`, each matched path links to it on the default branch. */
export function SignalRows({ signals, repo }: { signals: SignalResult[]; repo?: RepoLocation }) {
  const rows = signals.map((s) => ({
    id: s.id,
    pass: s.pass,
    detail: s.detail,
    ...(s.matchedPath ? { path: s.matchedPath } : {}),
  }));
  const location = repo && { url: repo.url, host: repo.host, default_branch: repo.default_branch };

  return <SignalRowsView rows={rows} repo={location} />;
}
