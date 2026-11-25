import type { FrameworkGuide } from "./types";

export const ANGULAR: FrameworkGuide = {
  slug: "angular",
  published: "2026-11-16",
  label: "Angular",
  kind: "app",
  languages: ["TypeScript"],
  // OpenProject is a Rails app whose front end is Angular.
  repos: [
    "github/bitwarden/clients",
    "github/NG-ZORRO/ng-zorro-antd",
    "github/taiga-family/taiga-ui",
    "github/ghostfolio/ghostfolio",
    "github/opf/openproject",
  ],
  frameworkRepo: "github/angular/angular",
  intro:
    "Agents learned Angular from NgModules, zone.js and `*ngIf`. Standalone is the default since v20, new apps are zoneless since v21, and new CLI projects test with Vitest; Angular publishes its own AI rules file to start from.",
  commands: [
    { cmd: "ng serve", note: "dev server" },
    { cmd: "ng build", note: "the `@angular/build:application` builder by default" },
    { cmd: "ng test", note: "Vitest in new projects; Karma still supported" },
    { cmd: "ng generate component <name>", note: "or `ng g`; scaffolds where the CLI expects" },
    { cmd: "npx @angular/cli mcp", note: "the CLI's experimental MCP server" },
  ],
  layout: [
    "The Angular major, and whether the app is zoneless or still loads zone.js.",
    "The test runner, Vitest or Karma, so tests use the right APIs.",
    "Which project in `angular.json` is the app, and where feature folders and shared libraries live.",
  ],
  rules: [
    "Don't set `standalone: true`; it is the default since v20.",
    "Use `@if`, `@for` and `@switch`, not `*ngIf`, `*ngFor` and `*ngSwitch`.",
    "Signals for state and `computed()` for derived state.",
    "Zoneless is the default since v21; don't rely on zone.js to trigger change detection.",
  ],
  sources: [
    "https://angular.dev/ai/develop-with-ai",
    "https://angular.dev/ai/mcp",
    "https://angular.dev/guide/zoneless",
    "https://angular.dev/guide/testing",
    "https://angular.dev/cli/generate",
    "https://angular.dev/reference/releases",
  ],
};
