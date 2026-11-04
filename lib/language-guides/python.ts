import type { AgentsMdGuide } from "../framework-guides/types";

export const PYTHON: AgentsMdGuide = {
  slug: "python",
  label: "Python",
  intro:
    "Python tooling differs most from repo to repo, so name yours first: the package manager, linter, type checker and test runner, each as the command you run. The lockfile shows the manager: `uv.lock` for uv, `poetry.lock` for Poetry.",
  commands: [
    { cmd: "uv run pytest", note: "locks and syncs the environment first; no activation needed" },
    { cmd: "poetry install && poetry run pytest", note: "the Poetry way; installs the versions in `poetry.lock`" },
    { cmd: "pytest tests/test_api.py::test_login", note: "one test by node id; `-k` selects by name" },
    { cmd: "ruff check --fix && ruff format", note: "lint with fixes, then format; `ruff format --check` in CI" },
    { cmd: "mypy src", note: "or `pyright`; name the one CI runs" },
    { cmd: "uv sync --locked", note: "for CI: fails on a stale `uv.lock` instead of rewriting it" },
  ],
  layout: [
    "`src/` or flat layout. With `src/`, the package must be installed (editable, in dev) before tests can import it.",
    "Which file holds each tool's config. Ruff uses the closest `.ruff.toml`, `ruff.toml` or `pyproject.toml` with `[tool.ruff]`; pyright prefers `pyrightconfig.json` over `pyproject.toml`. Neither merges files.",
    "The Python versions you support (`requires-python`), and where the virtualenv lives if not `.venv`.",
  ],
  rules: [
    "Run tools through the manager (`uv run`, `poetry run`), not a global `python` or `pytest`: the project environment is isolated from the shell.",
    "Commit the lockfile with the dependency change that moved it; `uv.lock` always belongs in git, `poetry.lock` for applications.",
    "mypy reads the first of `mypy.ini`, `.mypy.ini`, `pyproject.toml` and `setup.cfg` it finds; keep its settings in one.",
  ],
  sources: [
    "https://docs.astral.sh/uv/concepts/projects/sync/",
    "https://docs.astral.sh/uv/concepts/projects/layout/",
    "https://python-poetry.org/docs/basic-usage/",
    "https://docs.pytest.org/en/stable/how-to/usage.html",
    "https://docs.astral.sh/ruff/configuration/",
    "https://mypy.readthedocs.io/en/stable/config_file.html",
    "https://microsoft.github.io/pyright/#/configuration",
    "https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/",
  ],
};
