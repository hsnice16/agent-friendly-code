import type { FrameworkGuide } from "./types";

export const REACT: FrameworkGuide = {
  slug: "react",
  published: "2026-11-16",
  label: "React",
  kind: "app",
  languages: ["TypeScript", "JavaScript"],
  // Not Next.js apps, which have their own page; Plane's web app is on React Router.
  repos: [
    "github/excalidraw/excalidraw",
    "github/mui/material-ui",
    "github/grafana/grafana",
    "github/makeplane/plane",
    "github/tldraw/tldraw",
    "github/chakra-ui/chakra-ui",
    "github/mattermost/mattermost",
    "github/Uniswap/interface",
  ],
  frameworkRepo: "github/react/react",
  intro:
    "React says little about how an app is built, so say it: a framework or plain Vite, and whether React Compiler is on. Agents still reach for older React patterns, and `'use client'` means nothing without Server Components.",
  commands: [
    { cmd: "vite", note: "dev server, for an app not on a framework" },
    { cmd: "vite build", note: "production build; transpiles only" },
    { cmd: "tsc --noEmit", note: "type check: Vite does not" },
    { cmd: "eslint .", note: "with eslint-plugin-react-hooks for the rules of hooks" },
  ],
  layout: [
    "Framework (React Router, Next.js, …) or plain Vite; with a framework, link its own guide.",
    "Whether React Compiler is on, and for which directories if adoption is incremental.",
    "Where components, hooks and tests live, and which package is the app in a monorepo.",
  ],
  rules: [
    "With React Compiler on, don't add `useMemo`, `useCallback` or `React.memo` by hand.",
    "Hooks go at the top level: not in loops, conditions, nested functions or try/catch, and never after an early return.",
    "StrictMode runs every effect's setup and cleanup an extra time in development; a double log is not a bug, a missing cleanup is.",
    "`'use client'` only matters with React Server Components in a framework that supports them.",
  ],
  sources: [
    "https://react.dev/learn/creating-a-react-app",
    "https://react.dev/learn/react-compiler",
    "https://react.dev/reference/rules/rules-of-hooks",
    "https://react.dev/reference/react/StrictMode",
    "https://react.dev/reference/rsc/use-client",
    "https://vite.dev/guide/features",
  ],
};
