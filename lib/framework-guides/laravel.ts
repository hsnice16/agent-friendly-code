import type { FrameworkGuide } from "./types";

export const LARAVEL: FrameworkGuide = {
  slug: "laravel",
  label: "Laravel",
  kind: "app",
  languages: ["PHP", "Blade"],
  // laravel/laravel is the application skeleton, an app on the framework; Filament is a package on it.
  repos: [
    "github/laravel/laravel",
    "github/coollabsio/coolify",
    "github/filamentphp/filament",
    "github/bagisto/bagisto",
    "github/koel/koel",
  ],
  frameworkRepo: "github/laravel/framework",
  intro:
    "Laravel's layout is predictable to agents, so spend the file on your stack and commands. With Laravel Boost, `php artisan boost:install` writes the agent files; put your rules in `.ai/guidelines/`, or the next run overwrites them.",
  commands: [
    { cmd: "composer run dev", note: "server, queue worker and Vite together" },
    { cmd: "php artisan test --filter=UserTest", note: "takes any Pest or PHPUnit argument" },
    { cmd: "./vendor/bin/pint --dirty", note: "fix style in uncommitted files only" },
    { cmd: "php artisan make:test UserTest --unit", note: "`tests/Feature` unless `--unit`" },
    { cmd: "php artisan boost:update", note: "refresh Boost guidelines and skills" },
  ],
  layout: [
    "Pest or PHPUnit, and what belongs in `tests/Unit` versus `tests/Feature`.",
    "The front end: Blade, Livewire, or Inertia with React, Vue or Svelte.",
    "Where your own agent rules live: `.ai/guidelines/` and `.ai/skills/` with Boost.",
  ],
  rules: [
    "Never commit `.env`; list its keys in `.env.example`, or commit only `.env.encrypted` from `php artisan env:encrypt`.",
    "Call `env()` only inside `config/`; once config is cached, `.env` is not loaded, so elsewhere use `config()`.",
    "Boost rebuilds its `CLAUDE.md` and `AGENTS.md` on `boost:install` and `boost:update`; edit `.ai/guidelines/` instead.",
    "Run `php artisan config:clear` before tests if config was cached.",
  ],
  sources: [
    "https://laravel.com/docs/13.x/installation",
    "https://laravel.com/docs/13.x/testing",
    "https://laravel.com/docs/13.x/configuration",
    "https://laravel.com/docs/13.x/pint",
    "https://laravel.com/docs/master/boost",
  ],
};
