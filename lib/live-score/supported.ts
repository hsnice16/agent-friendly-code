import type { RepoHost } from "../clients/github";

// Its own module so client components can import it without pulling in the
// materializer's node:fs dependencies.
//
// GitLab paginates its tree at 100 entries — gitlab-org/gitlab needs 1,000+
// sequential calls — and Bitbucket allows 60 API requests/hour unauthenticated.
// Both are implemented and score identically to a clone; neither survives public
// traffic yet. See tasks/0.7.0/03-live-score-pages.md.
export const SUPPORTED_HOSTS: RepoHost[] = ["github"];
