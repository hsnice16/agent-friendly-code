import type { FrameworkGuide } from "./types";

export const DOTNET: FrameworkGuide = {
  slug: "dotnet",
  published: "2026-11-16",
  label: ".NET",
  kind: "app",
  languages: ["C#"],
  // Files is a WinUI app and MAUI a UI framework, both on .NET; the rest are ASP.NET Core.
  repos: [
    "github/files-community/Files",
    "github/dotnet/maui",
    "github/bitwarden/server",
    "github/Sonarr/Sonarr",
    "github/OrchardCMS/OrchardCore",
    "github/MudBlazor/MudBlazor",
    "github/jellyfin/jellyfin",
  ],
  frameworkRepo: "github/dotnet/runtime",
  intro:
    "Agents learned .NET from versions now out of support, so state the SDK pinned in `global.json`, the target framework, and which runner `dotnet test` uses. Since .NET 10, `dotnet new sln` writes `.slnx`, and `dotnet test` can run on Microsoft.Testing.Platform.",
  commands: [
    { cmd: "dotnet build", note: "the solution or project in the current directory" },
    { cmd: 'dotnet test --filter "FullyQualifiedName~Orders"', note: "a subset; TUnit uses `--treenode-filter`" },
    { cmd: "dotnet format --verify-no-changes", note: "fails if formatting would change a file" },
    { cmd: 'dotnet user-secrets set "Db:Password" "…"', note: "development secrets, kept out of the repo" },
  ],
  layout: [
    "Which solution file is canonical (`.slnx` or `.sln`), and which project starts the app.",
    "Where `global.json` and `Directory.Packages.props` are, and that versions go there, not in each `.csproj`.",
    "Which projects are tests, and whether they run on VSTest or Microsoft.Testing.Platform.",
  ],
  rules: [
    "No passwords or keys in `appsettings.json`; use `dotnet user-secrets` in development.",
    "With Central Package Management, `<PackageReference>` has no `Version`; set it in `Directory.Packages.props`.",
    "`global.json` `sdk.version` takes a full version such as `10.0.100`, never `10` or `10.0.x`.",
    '`dotnet test` runs VSTest unless `global.json` sets `"test": { "runner": "Microsoft.Testing.Platform" }`.',
  ],
  sources: [
    "https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-10/sdk",
    "https://learn.microsoft.com/en-us/dotnet/core/testing/selective-unit-tests",
    "https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-format",
    "https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets",
    "https://learn.microsoft.com/en-us/nuget/consume-packages/central-package-management",
    "https://learn.microsoft.com/en-us/dotnet/core/tools/global-json",
  ],
};
