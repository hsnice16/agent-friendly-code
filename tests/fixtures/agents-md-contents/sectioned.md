# Acme AGENTS.md

## Project overview

Acme is a CLI for widgets. See [the architecture doc](docs/ARCHITECTURE.md) and https://acme.dev.

## Setup

```bash
pnpm install
```

## Build and test

```sh
pnpm build
pnpm test
pnpm vitest run src/parser.test.ts
```

### Notes

Run `go test ./...` for the Go helpers.

## Code style

- Use 2-space indentation.
- NEVER commit generated files.
- Do not edit `dist/` by hand.

## Pull requests

Keep commits small. Read [CONTRIBUTING](./CONTRIBUTING.md) and [the rules](#code-style).

```md
## Not a heading, inside a fence
```
