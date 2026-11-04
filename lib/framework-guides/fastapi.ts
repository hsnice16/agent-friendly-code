import type { FrameworkGuide } from "./types";

export const FASTAPI: FrameworkGuide = {
  slug: "fastapi",
  label: "FastAPI",
  kind: "service",
  languages: ["Python"],
  repos: [
    "github/Significant-Gravitas/AutoGPT",
    "github/langflow-ai/langflow",
    "github/apache/airflow",
    "github/immich-app/immich",
    "github/getnao/nao",
    "github/BerriAI/litellm",
    "github/gradio-app/gradio",
  ],
  frameworkRepo: "github/fastapi/fastapi",
  intro:
    "FastAPI is often one service in a larger repo, so say where it lives and how to start it alone. Then the two choices an agent can't infer: how handlers reach the database, and whether they may block.",
  commands: [
    { cmd: 'uv add "fastapi[standard]"', note: "installs the CLI, Uvicorn and httpx for tests" },
    { cmd: "fastapi dev", note: "auto-reload, listens on 127.0.0.1" },
    { cmd: "fastapi run", note: "no reload, listens on 0.0.0.0; how it runs in a container" },
    { cmd: "uv run pytest", note: "tests use `TestClient` from `fastapi.testclient`" },
  ],
  layout: [
    "Where the app object is created and where routers are included with `include_router`.",
    "One `APIRouter` per module under `routers/`, shared dependencies in one file.",
    "Where request and response models live, if not beside their routes.",
  ],
  rules: [
    "Use plain `def` for handlers that call a blocking library (most database drivers); `async def` only when everything inside is awaited.",
    "Inject shared resources with `Annotated[..., Depends(fn)]`, passing the function uncalled.",
    "Test functions are plain `def`, even for async endpoints, when they use `TestClient`.",
  ],
  sources: [
    "https://fastapi.tiangolo.com/fastapi-cli/",
    "https://fastapi.tiangolo.com/tutorial/testing/",
    "https://fastapi.tiangolo.com/async/",
    "https://fastapi.tiangolo.com/tutorial/dependencies/",
    "https://fastapi.tiangolo.com/tutorial/bigger-applications/",
  ],
};
