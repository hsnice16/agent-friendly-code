export const ACTION_FAQ = [
  {
    q: "What does the action do on a pull request?",
    a: "Scores the pull request and its target branch, then posts one comment with how the overall score, each check and each agent's score changed. Later pushes update that comment.",
  },
  {
    q: "Is it an AI code reviewer?",
    a: "No. It calls no model and reviews no code. It checks the files agents rely on, like AGENTS.md, tests and CI config.",
  },
  {
    q: "Why is AGENTS_BADGE_TOKEN required?",
    a: "It's an on switch, not a password. Any value turns the comment on; unset, the action does nothing, so template repos can ship the workflow without it running in every copy.",
  },
  {
    q: "Does it contact this website?",
    a: "No. The scorer and weights are bundled into the action, so it works even if this site is down.",
  },
  {
    q: "Does it work on private repos?",
    a: "Yes. Scoring runs on the CI machine and your code is never sent anywhere. The comment uses the workflow's own GITHUB_TOKEN.",
  },
  {
    q: "How do I pin a version?",
    a: "@v0 follows the latest 0.x release; an exact tag such as @v0.1.0 stays on one version.",
  },
];
