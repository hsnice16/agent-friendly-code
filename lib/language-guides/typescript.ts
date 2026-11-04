import type { AgentsMdGuide } from "../framework-guides/types";

export const TYPESCRIPT: AgentsMdGuide = {
  slug: "typescript",
  label: "TypeScript",
  intro:
    "The lockfile decides the package manager: `package-lock.json` for npm, `pnpm-lock.yaml` for pnpm, `yarn.lock` for Yarn, `bun.lock` for Bun. Name it, then give the type check, linter and test runner as the scripts you run through it.",
  commands: [
    { cmd: "npm ci", note: "installs exactly the lockfile; fails if it disagrees with `package.json`" },
    { cmd: "tsc --noEmit", note: "type check only, when a bundler or another tool compiles" },
    { cmd: "tsc -b", note: "with project references: plain `tsc` doesn't build the referenced projects" },
    { cmd: "eslint .", note: "flat config in `eslint.config.js` (or `.mjs`, `.cjs`, `.ts`)" },
    { cmd: "biome check --write .", note: "or Biome: format, lint and safe fixes in one; name the one you run" },
    { cmd: "pnpm --filter <pkg> test", note: "one workspace package; `<pkg>...` adds the packages it depends on" },
  ],
  layout: [
    "In a monorepo, where the workspace list is (`pnpm-workspace.yaml`, or `workspaces` in `package.json`) and which package holds what.",
    "Which `tsconfig` each package uses, and whether builds go through project references.",
    "The test runner (Vitest, Jest, `node --test`) and how to run one file with it.",
  ],
  rules: [
    "Use the repo's package manager for every install and script; another one writes a second lockfile.",
    "ESLint takes the nearest `eslint.config.*` above each file, so a package's own config replaces the root one.",
    "Say how strict to be about types: whether `any` or `@ts-expect-error` is ever allowed, and with what comment.",
  ],
  sources: [
    "https://docs.npmjs.com/cli/v11/commands/npm-ci",
    "https://www.typescriptlang.org/tsconfig/#noEmit",
    "https://www.typescriptlang.org/docs/handbook/project-references.html",
    "https://eslint.org/docs/latest/use/configure/configuration-files",
    "https://biomejs.dev/reference/cli/",
    "https://pnpm.io/filtering",
    "https://bun.com/docs/pm/lockfile",
  ],
};
