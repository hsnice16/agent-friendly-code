# 0.9.0 — every repo page answers "is it ready for agents?"

**Status**: released

This version gives each repo page the repo's own description, topics and agent files, adds pages for agents, topics and AGENTS.md examples, and puts Live Score on the home page.

The opt-out / claim flow and the at-scale package overlay, planned here, moved to [0.10.0](../0.10.0/README.md).

## Shipped

- **Agent leaderboards** — `/model/<id>` ranks every repo for one agent, indexed and in the sitemap; `/?model=<id>` redirects there.
- **Live Score names the best-fit agent** — a `/score` result has the same "At a glance" cards as a repo page (checks passed, best set up for, needs most work for), and `/score` is titled for the question it answers.
- **Repo pages compare each repo** — a "How <repo> compares" panel (against the leaderboard and language averages, how common its missing and passed checks are, the one fix that helps the most agents), six similar repos on every page, and shorter titles and descriptions.
- **GitLab repos get a language** — and Bitbucket languages use the same spelling as the rest, so both join the language hubs at the next rescore.
- **Package pages leave the index** — `/package/<registry>/<name>` is noindex and out of the sitemap, since it shows the linked repo's score.
- **Repo pages show the repo's own description and topics** — an About block in the hero (topics link to their topic page, or to a language hub when they name a language), on Live Score too, and in the page's structured data and, when it fits, its meta description. Filled in at the next rescore.
- **Repo pages answer "does it have an AGENTS.md?"** — an agent instructions panel (which agent files the repo has, linked, and how many repos have one), matched files in "All checks" link to the file on the default branch, each agent's score links to its board with the repo's rank there, a visible breadcrumb, an "On this page" navigation with the repo's own results first, and titles that lead with the AGENTS.md state.
- **AGENTS.md examples** — `/check/agents-md/examples` lists every AGENTS.md and CLAUDE.md on the leaderboard, linked to the file on its host, with its length, stars, language and score: the most-starred, the longest and shortest that pass, AGENTS.md vs CLAUDE.md counts, and popular repos without one.
- **Score your repo from the home page** — the Live Score form sits in the home hero, `/score` is titled for "is my repo ready for AI coding agents" and lists all the checks with their pass rates, and `/check` opens with a plain answer, the three checks that count most across agents, and a link to score your own.
- **Agent boards say what the agent reads** — each `/model/<id>` board opens with that agent's four highest-weighted checks and their pass rates, the docs its weights cite, and how many repos have its own file (CLAUDE.md, `.cursor/rules`, GEMINI.md, `.openhands/setup.sh`, `.aider.conf.yml`).
- **Other languages hub** — `/language/other` lists the repos in languages too small for their own hub, and those with no detected language, grouped by language.
- **The author's repos are labelled** — wherever repos are listed and in the repo page hero, hsnice16/agent-friendly-code reads "(this site's own repo)" and the author's other repos "(by this site's author)", and `/about` says how repos are chosen and gives a contact email.
- **`/methodology` dates the weights** — it says which release last changed them, and lists the agents so each one's weights are a click away.
- **Share images for agent boards and checks** — each gets its own card instead of the site-wide one.
- **A retry instead of a bare error** — an unexpected failure keeps the nav and footer and offers "Try again".
- **Topic pages** — `/topic/<slug>` ranks the repos sharing a topic (CLI, AI, databases, …) once enough of them do, with how they compare to the leaderboard and related topics; `/topics` lists them, and a repo's topic chips link to them. Filled in at the next rescore.
- **Repo descriptions on the boards** — each leaderboard row shows the repo's one-line description under its name, on wider screens.
- **Phone layouts** — boards, the AGENTS.md examples table and install snippets fit a 390px screen without sideways scrolling.
- **Hardening** — security headers on every page; registry lookups time out; repo URLs with `..` or unexpected characters are rejected. Siblings vendor the scorer changes in their 0.1.7.
