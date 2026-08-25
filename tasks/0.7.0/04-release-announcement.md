# 04 · Release announcement

**Status**: done

## Goal

Tell a returning visitor, once, that a release shipped — then get out of the way and stay quiet until the next one.

`/changelog` has always carried this information and nobody goes looking for it. The release number in the header is a fact with no story attached. This is the one place the two meet.

## Approach

**Driven by `lib/changelog.ts`, not by its own copy.** The notice renders `CHANGELOG[0].title` and nothing else. A dedicated blurb would be a second description of the same release, and the second copy is the one that goes stale. The cost is that release titles now have to read well in isolation — an acceptable constraint, since they already appear as `/changelog` headings.

**Gated on `CHANGELOG[0].label === APP_VERSION`.** The two are bumped together by convention but not by the type system, and a mismatch means one of them is mid-edit. Announcing nothing beats announcing the wrong release.

**The "seen" marker stores the version, not a boolean.** `localStorage["afc:release-seen"] = "0.7.0"`. That is what makes the next release show again with no reset step, no migration, and no expiry logic. A boolean would need one of those three.

**Marked seen on show, not on dismiss.** A visitor who leaves after two seconds has had their one announcement; a reload should not repeat it. "Exactly once per release" is the property worth having, and it is only achievable by writing at the moment of display.

**Client-only, home page only.** There are no accounts to hang the flag on, and a server-side one would make the home page uncacheable for everyone in order to personalise a single line of chrome. Storage throwing (private mode, storage disabled) is treated as *already seen* — announcing on every single visit is a worse failure than announcing on none.

## Placement

Anchored under the nav link for the page the release is about (`anchorHref`), so the pointer means something: *this* is the new thing, go here. The first cut pointed at the version pill — the same fact in shorter form, but it made the notice about a number rather than about a feature, and the pointer landed beside the pill rather than under it.

The position is measured from the link's own bounding rect, not offset from the container edge. The nav's contents decide where the link lands and those contents change — a link was added mid-development, which would have silently broken any hardcoded offset. The measurement re-runs on resize but not on scroll: the header is `sticky top-0`, so the link cannot move under the page.

**Full-nav screens only.** When the link has zero width the header has collapsed to a hamburger (below `md`), and the notice does not render at all — a pointer with nothing to point at is worse than silence, and the small viewport is where an unbidden card costs the most.

That makes the *order* inside the effect load-bearing: measure first, and return before `markReleaseSeen` when there is no anchor. Marking first would spend the one announcement on a screen that never showed it, and the visitor would never see it on that browser again. A resize that narrows past the breakpoint closes an open notice for the same reason it was never opened.

`role="status"` with `aria-live="polite"`, not `dialog`: it steals no focus and blocks nothing, so it must not announce itself as modal. Dismissible by button or Escape, and auto-hides after 12 seconds. The entrance animation needs no reduced-motion guard — `globals.css` already disables all animation under `prefers-reduced-motion: reduce`.

## Acceptance

- First home-page visit after a release shows the notice; a reload does not.
- Bumping `APP_VERSION` with a matching changelog entry shows it again.
- A version/changelog mismatch shows nothing.
- Dismiss button and Escape both close it; it never traps focus.
- Storage unavailable → no notice, no error.
- Pointer centres under the anchor link at 1440 and 800 wide, and the card stays inside the viewport at both.
- At hamburger width nothing renders **and** nothing is marked seen — widening and reloading still shows it.
- Narrowing past the breakpoint while it is open closes it.
