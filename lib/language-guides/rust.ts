import type { AgentsMdGuide } from "../framework-guides/types";

export const RUST: AgentsMdGuide = {
  slug: "rust",
  label: "Rust",
  intro:
    "Cargo makes the commands the same everywhere, so the useful lines are the flags: which features CI builds, whether warnings fail it, and the oldest Rust you support. In a workspace, say what each crate is.",
  commands: [
    { cmd: "cargo build --workspace", note: "every member; a virtual workspace root does this by default" },
    { cmd: "cargo test -p <crate> <name>", note: "one crate, tests whose name contains `<name>`; doc tests run too" },
    { cmd: "cargo clippy --all-targets -- -D warnings", note: "fails on any warning, rustc's included" },
    {
      cmd: "cargo fmt --all -- --check",
      note: "exits non-zero if anything is unformatted; settings in `rustfmt.toml`",
    },
    { cmd: "cargo test --all-features", note: "tests and Clippy build default features only unless told otherwise" },
  ],
  layout: [
    "The workspace members and what each crate is for; they share one `Cargo.lock` and `target/`.",
    "`rust-version` (the MSRV) and any `rust-toolchain.toml`, which pins the toolchain and its components.",
    "Shared versions in `[workspace.dependencies]`, which members inherit with `workspace = true`.",
  ],
  rules: [
    "Features must be additive: enabling one should never remove functionality.",
    "Code must build on `rust-version`; Clippy's `incompatible_msrv` lint flags newer APIs.",
    "Name the feature sets CI tests (default, `--no-default-features`, `--all-features`); a change can break one the agent never built.",
  ],
  sources: [
    "https://doc.rust-lang.org/cargo/commands/cargo-test.html",
    "https://doc.rust-lang.org/clippy/usage.html",
    "https://github.com/rust-lang/rustfmt",
    "https://doc.rust-lang.org/cargo/reference/workspaces.html",
    "https://doc.rust-lang.org/cargo/reference/features.html",
    "https://doc.rust-lang.org/cargo/reference/rust-version.html",
    "https://rust-lang.github.io/rustup/overrides.html",
  ],
};
