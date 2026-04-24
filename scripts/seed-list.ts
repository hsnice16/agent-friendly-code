export type Seed = { url: string; note?: string };

export const SEEDS: Seed[] = [
  // --- GitHub, JavaScript / TypeScript ---
  { url: "https://github.com/facebook/react", note: "React" },
  { url: "https://github.com/vercel/next.js", note: "Next.js framework" },
  { url: "https://github.com/tailwindlabs/tailwindcss", note: "Tailwind CSS" },
  { url: "https://github.com/honojs/hono", note: "Hono web framework" },
  { url: "https://github.com/sindresorhus/ky", note: "Tiny HTTP client" },
  { url: "https://github.com/withastro/astro", note: "Astro framework" },
  {
    note: "Classic Node web framework",
    url: "https://github.com/expressjs/express",
  },
  { url: "https://github.com/prettier/prettier", note: "Code formatter" },
  { url: "https://github.com/n8n-io/n8n", note: "n8n — workflow automation" },
  { url: "https://github.com/calcom/cal.diy", note: "Cal.com — cal.diy" },
  { url: "https://github.com/cloudflare/vinext", note: "Cloudflare Vinext" },
  {
    note: "TypeScript language",
    url: "https://github.com/microsoft/TypeScript",
  },
  { url: "https://github.com/vuejs/core", note: "Vue 3 core" },
  { url: "https://github.com/sveltejs/kit", note: "SvelteKit framework" },
  { url: "https://github.com/nuxt/nuxt", note: "Nuxt framework" },
  { url: "https://github.com/vitejs/vite", note: "Vite build tool" },
  { url: "https://github.com/eslint/eslint", note: "ESLint" },
  {
    note: "Biome — linter / formatter",
    url: "https://github.com/biomejs/biome",
  },
  { url: "https://github.com/vitest-dev/vitest", note: "Vitest test runner" },
  {
    note: "Playwright end-to-end testing",
    url: "https://github.com/microsoft/playwright",
  },
  {
    note: "Storybook UI workshop",
    url: "https://github.com/storybookjs/storybook",
  },
  {
    url: "https://github.com/shadcn-ui/ui",
    note: "shadcn/ui component collection",
  },
  { url: "https://github.com/TanStack/query", note: "TanStack Query" },
  { url: "https://github.com/TanStack/router", note: "TanStack Router" },
  {
    url: "https://github.com/trpc/trpc",
    note: "tRPC end-to-end typesafe APIs",
  },
  { url: "https://github.com/prisma/prisma", note: "Prisma ORM" },
  { url: "https://github.com/drizzle-team/drizzle-orm", note: "Drizzle ORM" },
  { url: "https://github.com/nestjs/nest", note: "NestJS framework" },
  { url: "https://github.com/fastify/fastify", note: "Fastify web framework" },
  { url: "https://github.com/remix-run/react-router", note: "React Router" },
  {
    note: "Zustand state management",
    url: "https://github.com/pmndrs/zustand",
  },
  { url: "https://github.com/axios/axios", note: "Axios HTTP client" },
  { url: "https://github.com/vercel/swr", note: "SWR data fetching" },
  { url: "https://github.com/microsoft/vscode", note: "VS Code editor" },
  { url: "https://github.com/Uniswap/interface", note: "Uniswap web app" },
  {
    note: "DefiLlama dashboard",
    url: "https://github.com/DefiLlama/defillama-app",
  },
  {
    note: "Wormhole Connect — cross-chain widget",
    url: "https://github.com/wormhole-foundation/wormhole-connect",
  },
  {
    url: "https://github.com/ghostfolio/ghostfolio",
    note: "Ghostfolio — personal finance dashboard",
  },
  { url: "https://github.com/nocodb/nocodb", note: "NocoDB — no-code DB" },
  {
    note: "Supabase — Postgres BaaS",
    url: "https://github.com/supabase/supabase",
  },
  { url: "https://github.com/appwrite/appwrite", note: "Appwrite — BaaS" },

  // --- GitHub, Python ---
  {
    note: "Python linter (Rust-powered)",
    url: "https://github.com/astral-sh/ruff",
  },
  { url: "https://github.com/pallets/flask", note: "Flask web framework" },
  { url: "https://github.com/django/django", note: "Django" },
  {
    note: "PostHog — product analytics",
    url: "https://github.com/PostHog/posthog",
  },
  {
    url: "https://github.com/getsentry/sentry",
    note: "Sentry — error tracking & performance monitoring",
  },
  {
    url: "https://github.com/apache/airflow",
    note: "Airflow — workflow orchestration",
  },
  {
    url: "https://github.com/apache/superset",
    note: "Superset — data exploration + viz",
  },
  {
    url: "https://github.com/microsoft/presidio",
    note: "Presidio — PII detection / anonymization",
  },
  { url: "https://github.com/psf/requests", note: "HTTP for humans" },
  {
    note: "Pydantic — data validation",
    url: "https://github.com/pydantic/pydantic",
  },
  { url: "https://github.com/fastapi/fastapi", note: "FastAPI framework" },
  { url: "https://github.com/pytest-dev/pytest", note: "pytest" },
  { url: "https://github.com/pandas-dev/pandas", note: "pandas" },
  { url: "https://github.com/numpy/numpy", note: "NumPy" },
  { url: "https://github.com/scikit-learn/scikit-learn", note: "scikit-learn" },
  { url: "https://github.com/streamlit/streamlit", note: "Streamlit" },
  { url: "https://github.com/gradio-app/gradio", note: "Gradio" },
  {
    note: "Ray — distributed compute",
    url: "https://github.com/ray-project/ray",
  },
  {
    url: "https://github.com/pola-rs/polars",
    note: "Polars — DataFrame (Rust, Python bindings)",
  },
  {
    note: "LlamaIndex — data framework for LLMs",
    url: "https://github.com/run-llama/llama_index",
  },

  // --- GitHub, Rust ---
  {
    note: "Rust learning exercises",
    url: "https://github.com/rust-lang/rustlings",
  },
  { url: "https://github.com/tokio-rs/tokio", note: "Tokio async runtime" },
  { url: "https://github.com/tokio-rs/axum", note: "Axum web framework" },
  { url: "https://github.com/serde-rs/serde", note: "Serde serialization" },
  {
    note: "Tauri — desktop app framework",
    url: "https://github.com/tauri-apps/tauri",
  },
  {
    note: "Turborepo monorepo build system",
    url: "https://github.com/vercel/turborepo",
  },
  { url: "https://github.com/zed-industries/zed", note: "Zed editor" },
  { url: "https://github.com/helix-editor/helix", note: "Helix modal editor" },
  { url: "https://github.com/nushell/nushell", note: "Nu shell" },
  { url: "https://github.com/starship/starship", note: "Starship prompt" },
  { url: "https://github.com/BurntSushi/ripgrep", note: "ripgrep" },
  {
    url: "https://github.com/sharkdp/bat",
    note: "bat — cat with syntax highlight",
  },
  { url: "https://github.com/sharkdp/fd", note: "fd — friendly find" },
  {
    url: "https://github.com/nautechsystems/nautilus_trader",
    note: "NautilusTrader — algorithmic trading (Rust + Python)",
  },
  {
    note: "Meilisearch — search engine",
    url: "https://github.com/meilisearch/meilisearch",
  },

  // --- GitHub, Go ---
  {
    note: "OSV-Scanner — vulnerability scanner",
    url: "https://github.com/google/osv-scanner",
  },
  { url: "https://github.com/kubernetes/kubernetes", note: "Kubernetes" },
  { url: "https://github.com/hashicorp/terraform", note: "Terraform" },
  { url: "https://github.com/hashicorp/vault", note: "Vault" },
  { url: "https://github.com/grafana/grafana", note: "Grafana" },
  { url: "https://github.com/prometheus/prometheus", note: "Prometheus" },
  { url: "https://github.com/cli/cli", note: "GitHub CLI (gh)" },
  { url: "https://github.com/spf13/cobra", note: "Cobra — CLI library" },
  { url: "https://github.com/gin-gonic/gin", note: "Gin web framework" },
  { url: "https://github.com/labstack/echo", note: "Echo web framework" },
  {
    url: "https://github.com/etcd-io/etcd",
    note: "etcd — distributed key-value store",
  },
  { url: "https://github.com/junegunn/fzf", note: "fzf — fuzzy finder" },
  { url: "https://github.com/privy-io/go-sdk", note: "Privy Go SDK" },
  { url: "https://github.com/pingcap/tidb", note: "TiDB — distributed SQL" },

  // --- GitHub, C / C++ / systems ---
  {
    note: "MuJoCo — physics simulator",
    url: "https://github.com/google-deepmind/mujoco",
  },
  {
    url: "https://github.com/openclaw/openclaw",
    note: "OpenClaw — Captain Claw engine reimplementation",
  },
  { url: "https://github.com/redis/redis", note: "Redis in-memory data store" },
  { url: "https://github.com/curl/curl", note: "curl" },
  { url: "https://github.com/godotengine/godot", note: "Godot game engine" },
  { url: "https://github.com/obsproject/obs-studio", note: "OBS Studio" },
  { url: "https://github.com/neovim/neovim", note: "Neovim editor" },
  {
    note: "ONNX Runtime — ML inference",
    url: "https://github.com/microsoft/onnxruntime",
  },
  {
    note: "ClickHouse — columnar OLAP database",
    url: "https://github.com/ClickHouse/ClickHouse",
  },

  // --- GitHub, JVM (Java / Kotlin) ---
  {
    note: "Spring Boot",
    url: "https://github.com/spring-projects/spring-boot",
  },
  {
    note: "Spring Framework",
    url: "https://github.com/spring-projects/spring-framework",
  },
  { url: "https://github.com/elastic/elasticsearch", note: "Elasticsearch" },
  { url: "https://github.com/apache/kafka", note: "Apache Kafka" },
  { url: "https://github.com/JetBrains/kotlin", note: "Kotlin language" },
  {
    url: "https://github.com/google/guava",
    note: "Guava — Google core Java libraries",
  },

  // --- GitHub, Swift ---
  { url: "https://github.com/apple/swift", note: "Swift language" },
  {
    note: "Vapor — Swift web framework",
    url: "https://github.com/vapor/vapor",
  },

  // --- GitHub, Ruby ---
  {
    note: "Gumroad (Ruby on Rails)",
    url: "https://github.com/antiwork/gumroad",
  },

  // --- GitHub, Dart ---
  {
    note: "Flutter sample apps",
    url: "https://github.com/flutter/samples",
  },

  // --- GitHub, language runtimes ---
  { url: "https://github.com/denoland/deno", note: "Deno runtime (Rust)" },
  { url: "https://github.com/oven-sh/bun", note: "Bun runtime (Zig)" },

  // --- AI-native: coding agents ---
  {
    note: "Open coding agent (formerly OpenDevin)",
    url: "https://github.com/All-Hands-AI/OpenHands",
  },
  {
    note: "OpenCode — CLI coding agent",
    url: "https://github.com/sst/opencode",
  },
  {
    url: "https://github.com/anthropics/claude-code",
    note: "Claude Code (meta — what scores us in turn)",
  },
  {
    note: "OpenAI Codex CLI coding agent",
    url: "https://github.com/openai/codex",
  },
  {
    note: "This project — meta self-ranking",
    url: "https://github.com/hsnice16/agent-friendly-code",
  },
  {
    url: "https://github.com/farzaa/clicky",
    note: "Clicky — coding-agent side project",
  },
  {
    note: "TwoFac — 2FA TOTP manager",
    url: "https://github.com/championswimmer/TwoFac",
  },
  {
    note: "pretext — chenglou",
    url: "https://github.com/chenglou/pretext",
  },
  {
    note: "Gemini CLI coding agent",
    url: "https://github.com/google-gemini/gemini-cli",
  },
  {
    url: "https://github.com/github/spec-kit",
    note: "GitHub Spec Kit — spec-driven development toolkit",
  },

  // --- AI-native: models + infra ---
  {
    note: "Transformers library",
    url: "https://github.com/huggingface/transformers",
  },
  { url: "https://github.com/ggml-org/llama.cpp", note: "Local LLM inference" },
  {
    note: "LLaMA Factory — LLM fine-tuning framework",
    url: "https://github.com/hiyouga/LlamaFactory",
  },
  {
    note: "High-throughput LLM serving",
    url: "https://github.com/vllm-project/vllm",
  },
  { url: "https://github.com/BerriAI/litellm", note: "Unified LLM proxy" },
  {
    note: "LangChain — LLM app framework",
    url: "https://github.com/langchain-ai/langchain",
  },
  {
    note: "OpenAI Cookbook — API examples / recipes",
    url: "https://github.com/openai/openai-cookbook",
  },
  {
    url: "https://github.com/karpathy/nanochat",
    note: "nanochat — Karpathy's minimal LLM stack",
  },
  {
    note: "Whisper — speech-to-text",
    url: "https://github.com/openai/whisper",
  },
  {
    note: "nanoGPT — minimal GPT training",
    url: "https://github.com/karpathy/nanoGPT",
  },
  {
    note: "llm.c — LLM training in pure C",
    url: "https://github.com/karpathy/llm.c",
  },
  {
    note: "whisper.cpp — CPU Whisper inference",
    url: "https://github.com/ggml-org/whisper.cpp",
  },
  {
    note: "Diffusers — diffusion models",
    url: "https://github.com/huggingface/diffusers",
  },
  {
    note: "Datasets — ML dataset hub library",
    url: "https://github.com/huggingface/datasets",
  },
  { url: "https://github.com/explosion/spaCy", note: "spaCy — industrial NLP" },
  {
    note: "FAISS — vector similarity search",
    url: "https://github.com/facebookresearch/faiss",
  },
  {
    note: "AutoGPT — autonomous AI agent",
    url: "https://github.com/Significant-Gravitas/AutoGPT",
  },
  {
    note: "Stable Diffusion WebUI",
    url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
  },
  {
    note: "Langflow — visual LLM flow builder",
    url: "https://github.com/langflow-ai/langflow",
  },
  {
    note: "Open WebUI — local LLM chat interface",
    url: "https://github.com/open-webui/open-webui",
  },
  {
    url: "https://github.com/firecrawl/firecrawl",
    note: "Firecrawl — web-to-markdown crawler for LLMs",
  },
  {
    note: "Crawl4AI — LLM-friendly web crawler",
    url: "https://github.com/unclecode/crawl4ai",
  },
  {
    note: "Supermemory — AI memory API",
    url: "https://github.com/supermemoryai/supermemory",
  },

  // --- AI-native: application SDKs ---
  { url: "https://github.com/vercel/ai", note: "Vercel AI SDK" },
  {
    note: "Microsoft AI (user-supplied)",
    url: "https://github.com/microsoft/AI",
  },
  { url: "https://github.com/stripe/ai", note: "Stripe AI (user-supplied)" },
  { url: "https://github.com/cloudflare/ai", note: "Cloudflare Workers AI" },
  {
    note: "TanStack AI (user-supplied)",
    url: "https://github.com/TanStack/ai",
  },
  { url: "https://github.com/symfony/ai", note: "Symfony AI (user-supplied)" },
  { url: "https://github.com/laravel/ai", note: "Laravel AI (user-supplied)" },
  { url: "https://github.com/flutter/ai", note: "Flutter AI (user-supplied)" },

  // --- GitLab ---
  { url: "https://gitlab.com/gitlab-org/cli", note: "GitLab's own CLI (Go)" },
  {
    note: "GitLab Runner (Go)",
    url: "https://gitlab.com/gitlab-org/gitlab-runner",
  },

  // --- Bitbucket ---
  {
    note: "Historic Bitbucket OSS (Java)",
    url: "https://bitbucket.org/snakeyaml/snakeyaml",
  },
];
