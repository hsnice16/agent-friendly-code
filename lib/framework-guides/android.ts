import type { FrameworkGuide } from "./types";

export const ANDROID: FrameworkGuide = {
  slug: "android",
  label: "Android",
  kind: "app",
  languages: ["Kotlin", "Java"],
  // TwoFac and Coil are Kotlin Multiplatform; both build an Android target with AGP.
  repos: [
    "github/android/nowinandroid",
    "github/mihonapp/mihon",
    "github/thunderbird/thunderbird-android",
    "github/square/leakcanary",
    "github/coil-kt/coil",
    "github/championswimmer/TwoFac",
  ],
  // The platform lives on googlesource; Jetpack is the part apps build on that takes GitHub PRs.
  frameworkRepo: "github/androidx/androidx",
  intro:
    "Agents learned Android builds from AGP 7 and 8, so say you are on AGP 9, where built-in Kotlin and the new DSL are the default. Android Studio's agent reads AGENTS.md from the current directory and every parent, so a module can have its own.",
  commands: [
    { cmd: "./gradlew assembleDebug", note: "debug APK, signed with the debug key" },
    { cmd: "./gradlew test", note: "local unit tests on the JVM" },
    { cmd: "./gradlew connectedAndroidTest", note: "instrumented tests, on a device or emulator" },
    { cmd: "./gradlew lint", note: "not run by the build; default variant only" },
  ],
  layout: [
    "Which module is the app, which are libraries, and which have their own AGENTS.md.",
    "That versions live in `gradle/libs.versions.toml` and build files use its `libs.` aliases.",
    "Jetpack Compose or XML views, and which one new screens use.",
  ],
  rules: [
    "AGP 9 has built-in Kotlin: don't add the `org.jetbrains.kotlin.android` plugin, which the new DSL rejects.",
    "AGP 9 removed `applicationVariants` and the old variant API; use `androidComponents.onVariants`.",
    "Signing passwords stay out of build files and git.",
  ],
  sources: [
    "https://developer.android.com/studio/gemini/agent-files",
    "https://developer.android.com/build/releases/agp-9-0-0-release-notes",
    "https://developer.android.com/build/building-cmdline",
    "https://developer.android.com/studio/test/command-line",
    "https://developer.android.com/studio/write/lint",
    "https://developer.android.com/build/migrate-to-catalogs",
  ],
};
