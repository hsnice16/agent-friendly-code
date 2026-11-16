import type { FrameworkGuide } from "./types";

export const IOS: FrameworkGuide = {
  slug: "ios",
  label: "iOS",
  kind: "app",
  languages: ["Swift"],
  repos: [
    "github/mozilla-mobile/firefox-ios",
    "github/wordpress-mobile/WordPress-iOS",
    "github/home-assistant/iOS",
    "github/onevcat/Kingfisher",
  ],
  // UIKit and SwiftUI are closed source, so no repo's file speaks for them.
  frameworkRepo: "",
  intro:
    "Agents learned Swift before Swift 6 strict concurrency and Swift Testing, so state the Xcode version, each target's language mode, and which test framework new tests use. Give the exact scheme and destination: agents can't guess them.",
  commands: [
    { cmd: "xcodebuild -list", note: "schemes, targets and configurations" },
    { cmd: "xcodebuild -scheme App build", note: "build one scheme" },
    {
      cmd: "xcodebuild test -scheme App -destination 'platform=iOS Simulator,name=iPhone 17'",
      note: "tests on a simulator; name one installed on the machine",
    },
    { cmd: "xcodebuild test … -only-testing:AppTests/FooTests", note: "one test target, class or method" },
    { cmd: "swift test", note: "tests of a local Swift package" },
  ],
  layout: [
    "Workspace or project (`-workspace` or `-project`), and the scheme and destination CI uses.",
    "Which code is in local Swift packages, tested with `swift test`, and which in app targets.",
    "Each target's Swift Language Version and Strict Concurrency Checking level.",
  ],
  rules: [
    "In Swift 6 language mode data races are compile errors; fix them, don't drop the target back to Swift 5.",
    "New tests use Swift Testing (`import Testing`, `@Test`, `#expect`); XCTest can stay alongside it.",
    "Migrate to Swift 6 one module at a time; name targets still on Swift 5 so an agent doesn't switch them.",
  ],
  sources: [
    "https://developer.apple.com/library/archive/technotes/tn2339/_index.html",
    "https://developer.apple.com/documentation/swift/adoptingswift6",
    "https://developer.apple.com/documentation/testing",
    "https://www.swift.org/documentation/server/guides/testing.html",
  ],
};
