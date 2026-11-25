import type { FrameworkGuide } from "./types";

export const REACT_NATIVE: FrameworkGuide = {
  slug: "react-native",
  published: "2026-11-16",
  label: "React Native",
  kind: "app",
  languages: ["TypeScript", "JavaScript"],
  // Uniswap's mobile app is Expo in a monorepo with its web app; Expo is built on React Native.
  repos: ["github/bluesky-social/social-app", "github/Expensify/App", "github/Uniswap/interface", "github/expo/expo"],
  frameworkRepo: "github/facebook/react-native",
  intro:
    "Agents learned React Native while the Legacy Architecture still existed; since 0.82 the New Architecture is the only one. State the Expo SDK and whether `ios/` and `android/` are generated. `create-expo-app` now adds an AGENTS.md that points at docs for your SDK.",
  commands: [
    { cmd: "npx expo start", note: "dev server (Metro) on localhost:8081" },
    { cmd: "npx expo run:ios", note: "build and run the native app; or `run:android`" },
    { cmd: "npx expo install <pkg>", note: "a version compatible with your SDK" },
    { cmd: "npx expo prebuild", note: "regenerate `ios/` and `android/` from app config" },
    { cmd: "npx expo-doctor", note: "diagnose project and dependency problems" },
  ],
  layout: [
    "Whether `ios/` and `android/` are gitignored and generated, or committed and maintained by hand.",
    "Where native changes live: config plugins and `app.json` / `app.config`, not the generated folders.",
    "The Expo SDK, and whether Expo Router is used and where its `app/` directory is.",
  ],
  rules: [
    "New Architecture only since 0.82: `newArchEnabled=false` and `RCT_NEW_ARCH_ENABLED=0` are ignored.",
    "With generated native folders, don't edit `ios/` or `android/`: prebuild overwrites them. Use a config plugin.",
    "Add libraries with `npx expo install`, not a bare `npm install`, so versions match the SDK.",
  ],
  sources: [
    "https://docs.expo.dev/agents",
    "https://docs.expo.dev/workflow/continuous-native-generation/",
    "https://docs.expo.dev/more/expo-cli/",
    "https://reactnative.dev/blog/2025/10/08/react-native-0.82",
  ],
};
