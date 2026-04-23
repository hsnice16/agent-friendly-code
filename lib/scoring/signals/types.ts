export type SignalResult = {
  id: string;
  label: string;
  detail: string;
  pass: number; // 0..1
  matchedPath?: string;
};

export type Signal = {
  id: string;
  label: string;
  description: string;
  improveSuggestion: string;
  check: (repoPath: string) => SignalResult;
};
