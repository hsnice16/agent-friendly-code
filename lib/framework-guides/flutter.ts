import type { FrameworkGuide } from "./types";

export const FLUTTER: FrameworkGuide = {
  slug: "flutter",
  label: "Flutter",
  kind: "app",
  languages: ["Dart"],
  // RustDesk's UI is Flutter over a Rust core; Immich's mobile app is Flutter.
  repos: [
    "github/localsend/localsend",
    "github/hiddify/hiddify-app",
    "github/flutter/packages",
    "github/lichess-org/mobile",
    "github/openfoodfacts/smooth-app",
    "github/rustdesk/rustdesk",
    "github/immich-app/immich",
  ],
  frameworkRepo: "github/flutter/flutter",
  intro:
    "Flutter publishes AI rules, agent skills and a Dart and Flutter MCP server (`dart mcp-server`), so point to those and keep AGENTS.md to this repo. The common slip is editing a generated `*.g.dart` file instead of rerunning build_runner.",
  commands: [
    { cmd: "flutter pub get", note: "after any pubspec.yaml change" },
    { cmd: "flutter analyze", note: "not `dart analyze`" },
    { cmd: "flutter test", note: "unit and widget tests; not `dart test`" },
    { cmd: "dart format .", note: "format" },
    { cmd: "dart run build_runner build --delete-conflicting-outputs", note: "regenerate `*.g.dart`" },
  ],
  layout: [
    "Which directory holds the app and its pubspec.yaml, in a repo with several packages.",
    "Which packages use code generation, and which `part '*.g.dart'` files come from it.",
    "Where integration tests live (`integration_test/`) and what device they need.",
  ],
  rules: [
    "Use `flutter analyze`, `flutter test` and `flutter pub`, not the bare `dart` commands.",
    "`*.g.dart` files come from build_runner; change the source and regenerate them.",
    "Integration tests run on a device: `flutter test integration_test/<file>.dart` from the project root.",
  ],
  sources: [
    "https://docs.flutter.dev/ai/get-started",
    "https://docs.flutter.dev/reference/flutter-cli",
    "https://docs.flutter.dev/data-and-backend/serialization/json",
    "https://docs.flutter.dev/testing/integration-tests",
    "https://docs.flutter.dev/tools/formatting",
  ],
};
