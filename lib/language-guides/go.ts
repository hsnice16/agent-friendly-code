import type { AgentsMdGuide } from "../framework-guides/types";

export const GO: AgentsMdGuide = {
  slug: "go",
  label: "Go",
  intro:
    "Agents know the `go` tool. What they can't see is which files are generated, which linters you run, and whether the repo is one module or a workspace. Say those, and how to run one test.",
  commands: [
    {
      cmd: "go build ./...",
      note: "every package; `./...` skips `testdata/`, `vendor/` and dot or underscore directories",
    },
    { cmd: "go test -race ./...", note: "all tests with the race detector; `-count=1` bypasses the test cache" },
    { cmd: "go test ./pkg/foo -run '^TestBar$'", note: "one test; `-run` is a regex, `X/Y` matches subtests" },
    { cmd: "go vet ./...", note: "`go test` runs only a high-confidence subset of vet's checks" },
    { cmd: "golangci-lint run", note: "reads `.golangci.yml` (or `.yaml`, `.toml`, `.json`); pin the version" },
    { cmd: "gofmt -l .", note: "lists unformatted files; or `goimports`, which also fixes imports" },
    { cmd: "go generate ./...", note: "never run by `go build` or `go test`; rerun after changing its inputs" },
    { cmd: "go mod tidy", note: "after adding or removing an import; syncs `go.mod` and `go.sum`" },
  ],
  layout: [
    "The module path in `go.mod`, and whether a `go.work` ties several modules together (`go env GOWORK` shows the one in use).",
    "Where commands live, usually `cmd/<name>/`, and what is under `internal/`: only code below its parent can import it.",
    "Which files are generated, and the `//go:generate` line or tool that makes each.",
  ],
  rules: [
    "A file that starts with `// Code generated … DO NOT EDIT.` is overwritten by the next `go generate`; edit its input instead.",
    "Commit generated files: clients build without running `go generate`.",
    "`go.work` is usually left out of git, so CI tests each module as others will use it; say so if yours is committed.",
  ],
  sources: [
    "https://pkg.go.dev/cmd/go",
    "https://go.dev/doc/modules/layout",
    "https://go.dev/ref/mod",
    "https://go.dev/blog/generate",
    "https://golangci-lint.run/docs/configuration/file/",
    "https://pkg.go.dev/golang.org/x/tools/cmd/goimports",
  ],
};
