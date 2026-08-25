const KEY = "afc:release-seen";

// Per-visitor and client-only: there are no accounts to hang a "seen" flag on,
// and a server-side one would make the home page uncacheable for everyone to
// personalise a single line of chrome.
//
// The stored value is the version that was announced, not a boolean — that is
// what makes the next release show again without any reset step.
export function hasSeenRelease(version: string): boolean {
  try {
    return window.localStorage.getItem(KEY) === version;
  } catch {
    // Private mode / storage disabled. Announcing every visit is a worse
    // failure than announcing none, so treat it as already seen.
    return true;
  }
}

export function markReleaseSeen(version: string): void {
  try {
    window.localStorage.setItem(KEY, version);
  } catch {}
}
