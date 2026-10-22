# 0.9.2 — share your score

**Status**: released

Work shipped since 0.9.1, cut as a patch so [0.10.0](../0.10.0/README.md) stays the maintainer opt-out and registry release.

## Shipped

- Live Score pages have a floating share button (X, LinkedIn, Bluesky, copy link) and a README badge, and a shared link previews with the repo's own score card.
- The README badge works for any public GitHub repo, not only leaderboard repos.
- The footer, and the skill page's right margin on wide screens, carry a "Listed on skills.sh" badge.
- Repo pages have a callout under the header for scoring your own repo on Live Score.
- A host rate limit during a Live Score offers a retry instead of a score built from missing files, cached for the hour.
- The Aider config check's fix adds `auto-test`, which Aider needs before it runs tests after edits.
- Google Analytics counts clicks on the Live Score, share and badge-copy buttons; /privacy says so.
- Pages fit phones down to 320px: leaderboard scores stay on screen, each suggested fix keeps the full width with its points below, and the floating buttons step aside for the footer.
