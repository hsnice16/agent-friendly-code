import type { FrameworkGuide } from "./types";

export const VUE: FrameworkGuide = {
  slug: "vue",
  published: "2026-11-16",
  label: "Vue",
  kind: "app",
  languages: ["TypeScript", "JavaScript", "Vue"],
  // n8n's editor and Directus's app are Vue 3 front ends; Nuxt is built on Vue.
  repos: [
    "github/louislam/uptime-kuma",
    "github/n8n-io/n8n",
    "github/nuxt/nuxt",
    "github/vuetifyjs/vuetify",
    "github/directus/directus",
    "github/nocodb/nocodb",
  ],
  frameworkRepo: "github/vuejs/core",
  intro:
    "Agents mix Vue 2 with Vue 3 and Nuxt 3 with Nuxt 4, so state the versions. In Nuxt 4, app code lives in `app/` and most imports are automatic, so an agent adding them learned another setup.",
  commands: [
    { cmd: "nuxt dev", note: "Nuxt dev server; checks no types" },
    { cmd: "nuxt typecheck", note: "runs vue-tsc; dev and build skip types" },
    { cmd: "nuxt prepare", note: "regenerate the `.nuxt` types after config changes" },
    { cmd: "vue-tsc --noEmit", note: "plain Vue on Vite: type check the SFCs Vite only transpiles" },
  ],
  layout: [
    "Plain Vue on Vite or Nuxt; for Nuxt, whether it uses the v4 `app/` srcDir or the older root layout.",
    "Which directories are auto-imported: `app/components`, `app/composables`, `app/utils`, and `server/utils` on the server.",
    "Where server code (`server/`) sits relative to app code, and any Nuxt layers.",
  ],
  rules: [
    "Nuxt auto-imports components, composables, utils and Vue APIs like `ref`; don't add imports, and use `#imports` when one must be explicit.",
    "The browser sees only `runtimeConfig.public`; secrets go in top-level `runtimeConfig`.",
    "Override config with `NUXT_` variables: `NUXT_PUBLIC_API_BASE` sets `public.apiBase`.",
  ],
  sources: [
    "https://vuejs.org/guide/quick-start",
    "https://vuejs.org/guide/typescript/overview",
    "https://nuxt.com/docs/4.x/getting-started/upgrade",
    "https://nuxt.com/docs/4.x/guide/concepts/auto-imports",
    "https://nuxt.com/docs/4.x/guide/going-further/runtime-config",
    "https://nuxt.com/docs/4.x/guide/concepts/typescript",
  ],
};
