export const HOST_LABELS: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
};

export const HOSTS = ["github", "gitlab", "bitbucket"] as const;
export type Host = (typeof HOSTS)[number];

export function isHost(v: string | undefined | null): v is Host {
  return v != null && (HOSTS as readonly string[]).includes(v);
}
