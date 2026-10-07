# 03 · Language hubs

**Status**: done

## Goal

Get repo pages crawled. Search Console (report dated 2026-10-04) had 343 of 395 sitemap URLs at "Discovered – currently not indexed": most repo pages were reachable only through deep `?page=N` leaderboard pages, and "Similar repos" linked every page to its language's top 3, so 80 of 372 repos ever received a link from it.

## What shipped

- `/language` and `/language/[slug]` — a hub per language with at least `LANGUAGE_HUB_MIN_REPOS` repos: the ranked list plus the cross-agent checks that language most often misses. Smaller languages list their repos on `/language`. Linked from the home page, the footer, each repo's header and the sitemap.
- "Similar repos" picks repos scoring near this one, in the same language and host, instead of the top 3, so 343 of 360 repos with a language are linked from another repo page.
- Language matching ignores case: the hosts report "Java" and "java" for the same language.

## Rejected

- **Single-agent checks in a hub's "most often miss" list.** `.aider.conf.yml`, `GEMINI.md` and the like are missing almost everywhere, so they would head every hub and say nothing about the language.
- **Hubs for languages under the minimum.** A one- or two-repo page is thin; those repos sit on `/language` instead.

## Measuring it

Search Console's "All submitted pages" view: "Discovered – currently not indexed" should fall below 343 within a few weeks of deploy.

## Known gap

GitLab repos have no language (`fetchRepoMeta` skips GitLab's `/languages` call), so they appear on no hub and get no Similar repos.
