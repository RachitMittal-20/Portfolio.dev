// Project case-study content (docs/BUILD_PLAN.md section 1.8). Every
// pitch/stack/challenge/build/result below is real — no invented tech
// claims. Case-study pages live at /work/[slug] (src/app/work/[slug]);
// projects with no public repo/demo yet are `comingSoon` and the page
// shows that instead of a dead link.
export interface ProjectLinks {
  repo?: string;
  demo?: string;
}

export interface Project {
  slug: string;
  title: string;
  /** One-line pitch. */
  pitch: string;
  /** Tech stack tags, in no particular order. */
  stack: string[];
  challenge: string;
  build: string;
  result: string;
  links: ProjectLinks;
  /** True when there's no public repo/demo yet. */
  comingSoon?: boolean;
  /** Placeholder hero/thumbnail treatment (a CSS colour token) until real
   *  renders or screenshots exist for each project. */
  accent: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: "trident-oracle",
    title: "Trident Oracle",
    pitch:
      "An invoice intake and three-way match engine — vendors submit invoices as PDFs or phone photos, the system extracts structured data, matches it against the Purchase Order and Goods Receipt, flags discrepancies for human review, and auto-posts clean, high-confidence, low-value invoices.",
    stack: [
      "Next.js 15",
      "TypeScript",
      "Tailwind",
      "shadcn/ui",
      "Framer Motion",
      "FastAPI",
      "Pydantic v2",
      "Python",
      "Supabase Postgres",
      "Gemini Flash",
      "Tesseract",
      "Telegram API",
    ],
    challenge:
      "Manual invoice matching against POs and goods receipts is slow and error-prone at volume.",
    build:
      "A monorepo (apps/web, apps/api, apps/worker, packages/core with zero I/O) with append-only audit logging, idempotency keys, and Postgres RLS enforced as the authorization boundary even inside the worker — a Python worker polls the queue with FOR UPDATE SKIP LOCKED, no Redis or Celery.",
    result:
      "Clean, high-confidence, low-value invoices auto-post; exceptions route to a human approver over Telegram, with a full audit trail preserved throughout.",
    links: {},
    comingSoon: true,
    accent: "var(--ember-500)",
    featured: true,
  },
  {
    slug: "ragforge",
    title: "RagForge",
    pitch:
      "A production-grade RAG pipeline with conversational query reformulation and a live evaluation dashboard.",
    stack: [
      "FastAPI",
      "ChromaDB",
      "sentence-transformers",
      "Groq",
      "Python",
      "SQLite",
      "React",
      "Recharts",
    ],
    challenge: "Off-the-shelf RAG evaluation tooling hit blocking dependency conflicts.",
    build:
      "A custom evaluation engine written from scratch, paired with conversational query reformulation and real-time monitoring over SQLite.",
    result: "A working, evaluable RAG pipeline with real-time monitoring — not just a demo.",
    links: { repo: "https://github.com/RachitMittal-20/RagForge" },
    accent: "var(--arcane-400)",
    featured: false,
  },
  {
    slug: "strong-path-diagnostics",
    title: "Strong Path Diagnostics",
    pitch:
      "A full B2B diagnostic testing platform — an internal Admin System for staff and a Client Portal for corporate clients, built as the primary deliverable of the Nile Technologies internship.",
    stack: [
      "Next.js 15",
      "TypeScript",
      "Tailwind",
      "shadcn/ui",
      "Framer Motion",
      "Supabase",
      "Resend",
      "react-pdf",
      "Vercel",
    ],
    challenge:
      "Needed a secure two-sided platform — internal staff vs. external corporate clients — with real data isolation and reliable PDF report delivery.",
    build:
      "Built via a 15-prompt sequential playbook with verification at each phase, closing real bugs along the way: RLS policy gaps on cycle data, PDF size limits, and a race-condition UNIQUE constraint fixed with an atomic Postgres RPC and a partial unique index.",
    result:
      "A live, deployed platform, later followed by a premium UI pass — glassmorphism, animated gradients, a split-panel login.",
    links: {
      repo: "https://github.com/RachitMittal-20/NileTech_Internship",
      demo: "https://strongpath-diagnostics.vercel.app",
    },
    accent: "var(--gold-400)",
    featured: false,
  },
  {
    slug: "primetrade-command-deck",
    title: "PrimeTrade Command Deck",
    pitch:
      "A professional-grade trading bot system for Binance Futures Testnet — CLI, REST API, and a live dashboard for placing and monitoring trades, built with observability and structured error handling as first-class concerns.",
    stack: [
      "Python",
      "httpx",
      "FastAPI",
      "Typer",
      "React",
      "Vite",
      "Tailwind",
      "Framer Motion",
      "Radix UI",
    ],
    challenge:
      "Most trading bot scripts fail silently or opaquely when something breaks against a live exchange API.",
    build:
      "Three integrated layers — CLI, REST API, dashboard — around a custom exception hierarchy (ValidationError, BinanceAPIError, NetworkError), full structured JSON logging of every Binance interaction, and startup credential health checks.",
    result:
      "Every order (MARKET, LIMIT, STOP-LIMIT) is placed with real-time PnL tracking, execution snapshots showing exact request/response payloads, and one-click cancellation — not a black-box script.",
    links: { repo: "https://github.com/RachitMittal-20/PrimatradeAI" },
    accent: "var(--arcane-400)",
    featured: false,
  },
];
