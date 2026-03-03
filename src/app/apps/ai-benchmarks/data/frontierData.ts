// ─────────────────────────────────────────────────────────────────────────────
// Frontier AI Model Benchmark Data
//
// Benchmarks & sources:
//   GPQA Diamond  – official model tech reports / stanford-crfm.github.io
//   SWE-bench V   – swebench.com official leaderboard (verified split, agentic)
//   ARC-AGI 2     – arcprize.org leaderboard (public validation set)
//   Arena ELO     – lmarena.ai Chatbot Arena (Bradley-Terry ELO)
//   GAIA val      – huggingface.co/spaces/gaia-benchmark/leaderboard (val set)
//
// Last verified: March 2026
// ─────────────────────────────────────────────────────────────────────────────

export type BenchmarkModel = {
  id: string;
  name: string;
  provider: string;
  providerColor: string;
  releasedAt: string;
  isOpenSource: boolean;
  isFree: boolean;        // free-tier API or free web UI available
  params?: string;
  gpqa: number | null;     // GPQA Diamond %
  swe: number | null;      // SWE-bench Verified % resolved (agentic)
  arcagi2: number | null;  // ARC-AGI 2 % on public val set
  arenaElo: number | null; // Chatbot Arena ELO (approximate)
  gaiaVal: number | null;  // GAIA val % (with tools/agents)
};

export const BENCHMARK_SOURCES = {
  gpqa: {
    key: "gpqa" as const,
    label: "GPQA \u25c6",
    fullName: "GPQA Diamond",
    desc: "476 PhD-level science MCQs (biology, chemistry, physics). Expert human accuracy \u224865\u202f%.",
    unit: "%",
    max: 100,
    source: "Official model tech reports",
    sourceUrl: "https://arxiv.org/abs/2311.12022",
  },
  swe: {
    key: "swe" as const,
    label: "SWE-bench",
    fullName: "SWE-bench Verified",
    desc: "% of real GitHub issues resolved by an AI agent. Gold standard for agentic coding ability.",
    unit: "%",
    max: 100,
    source: "swebench.com official leaderboard",
    sourceUrl: "https://www.swebench.com",
  },
  arcagi2: {
    key: "arcagi2" as const,
    label: "ARC-AGI 2",
    fullName: "ARC-AGI 2",
    desc: "Abstract visual grid reasoning. Adversarially designed against neural nets. Frontier models score <10\u202f%.",
    unit: "%",
    max: 100,
    source: "arcprize.org leaderboard",
    sourceUrl: "https://arcprize.org/arc-agi-2",
  },
  arenaElo: {
    key: "arenaElo" as const,
    label: "Arena ELO",
    fullName: "Chatbot Arena ELO",
    desc: "Bradley-Terry ELO from millions of blind human-preference battles on lmarena.ai. Higher = preferred.",
    unit: "pts",
    max: 1400,
    source: "lmarena.ai Chatbot Arena",
    sourceUrl: "https://lmarena.ai/?leaderboard",
  },
  gaiaVal: {
    key: "gaiaVal" as const,
    label: "GAIA val",
    fullName: "GAIA Validation",
    desc: "General AI Assistants benchmark (val set). Requires multi-step tool use, web search and reasoning.",
    unit: "%",
    max: 100,
    source: "HuggingFace GAIA leaderboard",
    sourceUrl: "https://huggingface.co/spaces/gaia-benchmark/leaderboard",
  },
};

export const BENCHMARK_COLS = Object.values(BENCHMARK_SOURCES);

export const MODELS: BenchmarkModel[] = [
  // ── OpenAI ─────────────────────────────────────────────────────────────
  {
    id: "o3",
    name: "o3",
    provider: "OpenAI",
    providerColor: "text-green-600 dark:text-green-400",
    releasedAt: "2025-04",
    isOpenSource: false,
    isFree: false,
    gpqa: 87.7,
    swe: 71.7,
    arcagi2: 4.0,
    arenaElo: 1356,
    gaiaVal: 60.8,
  },
  {
    id: "o1",
    name: "o1",
    provider: "OpenAI",
    providerColor: "text-green-600 dark:text-green-400",
    releasedAt: "2024-12",
    isOpenSource: false,
    isFree: false,
    gpqa: 77.3,
    swe: 48.9,
    arcagi2: null,
    arenaElo: 1336,
    gaiaVal: 38.7,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    providerColor: "text-green-600 dark:text-green-400",
    releasedAt: "2024-05",
    isOpenSource: false,
    isFree: true,
    gpqa: 53.6,
    swe: 38.8,
    arcagi2: null,
    arenaElo: 1285,
    gaiaVal: 32.0,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    providerColor: "text-green-600 dark:text-green-400",
    releasedAt: "2024-07",
    isOpenSource: false,
    isFree: true,
    gpqa: 40.2,
    swe: 23.5,
    arcagi2: null,
    arenaElo: 1198,
    gaiaVal: 18.3,
  },
  // ── Anthropic ───────────────────────────────────────────────────────────
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    providerColor: "text-orange-600 dark:text-orange-400",
    releasedAt: "2025-02",
    isOpenSource: false,
    isFree: true,
    gpqa: 84.8,
    swe: 70.3,
    arcagi2: null,
    arenaElo: 1321,
    gaiaVal: 74.0,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    providerColor: "text-orange-600 dark:text-orange-400",
    releasedAt: "2024-10",
    isOpenSource: false,
    isFree: true,
    gpqa: 65.0,
    swe: 49.0,
    arcagi2: null,
    arenaElo: 1271,
    gaiaVal: 74.1,
  },
  // ── Google ──────────────────────────────────────────────────────────────
  {
    id: "gemini-2-pro",
    name: "Gemini 2.0 Pro",
    provider: "Google",
    providerColor: "text-blue-600 dark:text-blue-400",
    releasedAt: "2025-02",
    isOpenSource: false,
    isFree: false,
    gpqa: 65.0,
    swe: 40.2,
    arcagi2: null,
    arenaElo: 1267,
    gaiaVal: 44.1,
  },
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    providerColor: "text-blue-600 dark:text-blue-400",
    releasedAt: "2025-02",
    isOpenSource: false,
    isFree: true,
    gpqa: 62.1,
    swe: 33.4,
    arcagi2: null,
    arenaElo: 1249,
    gaiaVal: 36.0,
  },
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    providerColor: "text-blue-600 dark:text-blue-400",
    releasedAt: "2024-09",
    isOpenSource: false,
    isFree: true,
    gpqa: 46.2,
    swe: 23.7,
    arcagi2: null,
    arenaElo: 1218,
    gaiaVal: 34.0,
  },
  // ── xAI ─────────────────────────────────────────────────────────────────
  {
    id: "grok-3",
    name: "Grok 3",
    provider: "xAI",
    providerColor: "text-purple-600 dark:text-purple-400",
    releasedAt: "2025-02",
    isOpenSource: false,
    isFree: true,
    gpqa: 75.0,
    swe: 47.0,
    arcagi2: null,
    arenaElo: 1312,
    gaiaVal: null,
  },
  // ── DeepSeek ─────────────────────────────────────────────────────────────
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    providerColor: "text-indigo-600 dark:text-indigo-400",
    releasedAt: "2025-01",
    isOpenSource: true,
    isFree: true,
    params: "~671B (MoE)",
    gpqa: 71.5,
    swe: 41.6,
    arcagi2: null,
    arenaElo: 1302,
    gaiaVal: null,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    providerColor: "text-indigo-600 dark:text-indigo-400",
    releasedAt: "2024-12",
    isOpenSource: true,
    isFree: true,
    params: "~671B (MoE)",
    gpqa: 59.1,
    swe: 42.0,
    arcagi2: null,
    arenaElo: 1205,
    gaiaVal: null,
  },
  // ── Meta ─────────────────────────────────────────────────────────────────
  {
    id: "llama-3-1-405b",
    name: "Llama 3.1 405B",
    provider: "Meta",
    providerColor: "text-sky-600 dark:text-sky-400",
    releasedAt: "2024-07",
    isOpenSource: true,
    isFree: true,
    params: "405B",
    gpqa: 50.7,
    swe: 29.4,
    arcagi2: null,
    arenaElo: 1121,
    gaiaVal: null,
  },
  {
    id: "llama-3-3-70b",
    name: "Llama 3.3 70B",
    provider: "Meta",
    providerColor: "text-sky-600 dark:text-sky-400",
    releasedAt: "2024-12",
    isOpenSource: true,
    isFree: true,
    params: "70B",
    gpqa: 50.5,
    swe: 27.8,
    arcagi2: null,
    arenaElo: 1102,
    gaiaVal: null,
  },
  // ── Alibaba ──────────────────────────────────────────────────────────────
  {
    id: "qwen-2-5-72b",
    name: "Qwen 2.5 72B",
    provider: "Alibaba",
    providerColor: "text-amber-600 dark:text-amber-400",
    releasedAt: "2024-09",
    isOpenSource: true,
    isFree: true,
    params: "72B",
    gpqa: 49.0,
    swe: 30.6,
    arcagi2: null,
    arenaElo: 1095,
    gaiaVal: null,
  },
  // ── Mistral ──────────────────────────────────────────────────────────────
  {
    id: "mistral-large-2",
    name: "Mistral Large 2",
    provider: "Mistral",
    providerColor: "text-rose-600 dark:text-rose-400",
    releasedAt: "2024-07",
    isOpenSource: false,
    isFree: false,
    params: "123B",
    gpqa: 39.6,
    swe: 17.1,
    arcagi2: null,
    arenaElo: 1046,
    gaiaVal: null,
  },
];

export const DATA_DATE = "March 2026";
