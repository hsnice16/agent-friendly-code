export type CheckContent = {
  /** Page heading and `<title>`. */
  title: string;
  description: string;
  what: string;
  why: string;
  /** One entry per outcome the check can return, best first. Must match the signal's `check`. */
  scoring: string[];
  fix: string;
};
