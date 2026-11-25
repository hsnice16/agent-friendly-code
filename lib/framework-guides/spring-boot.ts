import type { FrameworkGuide } from "./types";

export const SPRING_BOOT: FrameworkGuide = {
  slug: "spring-boot",
  published: "2026-11-16",
  label: "Spring Boot",
  kind: "app",
  languages: ["Java", "Kotlin"],
  // Spring Framework is underneath Boot, not built on it, so it is not listed.
  repos: [
    "github/halo-dev/halo",
    "github/apolloconfig/apollo",
    "github/alibaba/nacos",
    "github/conductor-oss/conductor",
  ],
  frameworkRepo: "github/spring-projects/spring-boot",
  intro:
    "Most Spring Boot code agents learned is 3.x, and Boot 4 breaks it: starters are split into modules, Jackson 3 moves packages, and test annotations were removed. State the Boot version and build tool.",
  commands: [
    { cmd: "mvn spring-boot:run", note: "or `gradle bootRun`; runs exploded, as in the IDE" },
    { cmd: "mvn spring-boot:test-run", note: "or `gradle bootTestRun`: the test main, with dev services" },
  ],
  layout: [
    "Maven or Gradle, and whether the wrapper (`./mvnw`, `./gradlew`) is checked in.",
    "Whether `src/test` has a test main that starts dev services with `SpringApplication.from(…)`.",
    "`application.properties` or `application.yaml`, and which profiles exist.",
  ],
  rules: [
    "Boot 4 needs Java 17+ and Jakarta EE 11; `spring-boot-starter-web` is deprecated for `spring-boot-starter-webmvc`.",
    "Jackson 3: import `tools.jackson.*` (annotations stay in `com.fasterxml.jackson.annotation`), and `@JsonComponent` is now `@JacksonComponent`.",
    "`@MockBean` and `@SpyBean` were removed for `@MockitoBean` and `@MockitoSpyBean`; `@SpringBootTest` no longer sets up MockMvc without `@AutoConfigureMockMvc`.",
    "Put `@ServiceConnection` on a Testcontainers field instead of writing connection properties by hand.",
  ],
  sources: [
    "https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide",
    "https://docs.spring.io/spring-boot/system-requirements.html",
    "https://docs.spring.io/spring-boot/reference/using/running-your-application.html",
    "https://docs.spring.io/spring-boot/reference/features/dev-services.html",
    "https://docs.spring.io/spring-boot/reference/testing/testcontainers.html",
  ],
};
