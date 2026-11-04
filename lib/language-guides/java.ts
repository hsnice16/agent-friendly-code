import type { AgentsMdGuide } from "../framework-guides/types";

export const JAVA: AgentsMdGuide = {
  slug: "java",
  label: "Java",
  intro:
    "Say whether the build is Maven or Gradle, and run it through the wrapper the repo commits (`./mvnw`, `./gradlew`), which fetches the build tool version the project pins. In a multi-module build, say how to build and test one module.",
  commands: [
    { cmd: "./gradlew build", note: "assembles and runs every check, tests included" },
    { cmd: "./gradlew test --tests FooTest.bar", note: "one test class or method" },
    { cmd: "./mvnw verify", note: "the Maven lifecycle up to `verify`, integration tests included" },
    { cmd: "./mvnw -pl :core -am test", note: "one module, plus the modules it depends on" },
    { cmd: "./mvnw test -Dtest=FooTest#bar", note: "one test method, with Surefire" },
  ],
  layout: [
    "The modules and what each holds: `<modules>` in the root `pom.xml`, or `settings.gradle(.kts)`.",
    "The JDK version the build needs.",
    "Any generated sources (annotation processors, protobuf, OpenAPI) and the task that makes them.",
  ],
  rules: [
    "Use the wrapper, not an installed `mvn` or `gradle`, which may be another version.",
    "In a multi-module Maven build, `-Dtest` fails every module with no matching test; add `-Dsurefire.failIfNoSpecifiedTests=false`.",
    "`-pl my-module` selects a directory and `-pl :my-module` an artifactId.",
  ],
  sources: [
    "https://docs.gradle.org/current/userguide/gradle_wrapper.html",
    "https://docs.gradle.org/current/userguide/java_plugin.html",
    "https://docs.gradle.org/current/userguide/java_testing.html",
    "https://maven.apache.org/tools/wrapper/",
    "https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html",
    "https://maven.apache.org/guides/mini/guide-multiple-modules.html",
    "https://maven.apache.org/surefire/maven-surefire-plugin/test-mojo.html",
  ],
};
