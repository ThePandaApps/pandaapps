"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bot,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Info,
  ExternalLink,
  RefreshCw,
  Search,
  AlertCircle,
  Wifi,
} from "lucide-react";
import type { LiveModel, LiveBenchmarkResponse } from "@/app/api/live-benchmarks/route";

const COLUMNS = [
  { key: "rank",     label: "#",        title: "Ranking by average score" },
  { key: "model",    label: "Model",    title: "Organisation / model name" },
  { key: "params",   label: "Params",   title: "Parameter count in billions" },
  { key: "average",  label: "Avg",      title: "Average across all 6 benchmarks" },
  { key: "ifeval",   label: "IFEval",   title: "Instruction Following Eval" },
  { key: "bbh",      label: "BBH",      title: "BIG-Bench Hard – reasoning" },
  { key: "math",     label: "Math",     title: "MATH Level 5 – competition math" },
  { key: "gpqa",     label: "GPQA",     title: "GPQA Diamond – PhD-level science" },
  { key: "musr",     label: "MUSR",     title: "MuSR – multi-step soft reasoning" },
  { key: "mmlu_pro", label: "MMLU-Pro", title: "MMLU-Pro – 10-choice knowledge" },
] as const;

type SortKey = "rank" | "model" | "params" | "average" | "ifeval" | "bbh" | "math" | "gpqa" | "musr" | "mmlu_pro";
type SortDir = "asc" | "desc";

function scoreColor(v: number | null): string {
  if (v === null) return "text-muted/40";
  if (v >= 90) return "text-emerald-600 dark:text-emerald-400 font-bold";
  if (v >= 80) return "text-green-600 dark:text-green-400 font-semibold";
  if (v >= 70) return "text-lime-600 dark:text-lime-400 font-semibold";
  if (v >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (v >= 50) return "text-amber-600 dark:text-amber-400";
  if (v >= 35) return "text-orange-600 dark:text-orange-400";
  return "text-red-500 dark:text-red-400";
}

function scoreBg(v: number | null): string {
  if (v === null) return "";
  if (v >= 90) return "bg-emerald-500/15";
  if (v >= 80) return "bg-green-500/10";
  return "";
}

function SortIcon({ col, sortKey, sortDir }: { col: string; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3 w-3 text-violet-500" />
    : <ChevronDown className="h-3 w-3 text-violet-500" />;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/30 animate-pulse">
      {COLUMNS.map((c) => (
        <td key={c.key} className="px-3 py-3">
          <div className="h-4 rounded bg-muted/20" style={{ width: c.key === "model" ? "160px" : "40px" }} />
        </td>
      ))}
    </tr>
  );
}

function formatParams(p: string | null): string {
  if (!p) return "\u2014";
  const n = parseFloat(p);
  if (isNaN(n)) return "\u2014";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}T`;
  if (n >= 1) return `${n.toFixed(1)}B`;
  return `${(n * 1000).toFixed(0)}M`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AIBenchmarksClient() {
  const [data, setData] = useState<LiveBenchmarkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("average");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LiveModel | null>(null);
  const [, forceUpdate] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/live-benchmarks");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json: LiveBenchmarkResponse = await res.json();
      if ((json as { error?: string }).error) throw new Error((json as { error?: string }).error);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "model" ? "asc" : "desc");
    }
  }

  const sorted = useMemo(() => {
    if (!data) return [];
    let rows = data.models;
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        m =>
          m.fullName.toLowerCase().includes(q) ||
          m.org.toLowerCase().includes(q) ||
          m.model.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      let av: number | string | null = null;
      let bv: number | string | null = null;
      if (sortKey === "model") { av = a.fullName; bv = b.fullName; }
      else if (sortKey === "params") {
        av = a.params ? parseFloat(a.params) : null;
        bv = b.params ? parseFloat(b.params) : null;
      } else {
        av = a[sortKey as keyof LiveModel] as number | null;
        bv = b[sortKey as keyof LiveModel] as number | null;
      }
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [data, search, sortKey, sortDir]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-border/60">&middot;</span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Bot className="h-4 w-4 text-violet-500" />
            AI Model Benchmarks
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            {data && (
              <span className="text-xs text-muted hidden sm:block">
                Updated {timeAgo(data.fetchedAt)}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg border border-border/40 px-2.5 py-1 text-xs hover:border-violet-500/40 hover:text-violet-500 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
              <Wifi className="h-3 w-3" />
              Live data
            </div>
            {data && (
              <span className="text-xs text-muted">
                {data.total} models &middot;{" "}
                <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-violet-500">
                  {data.source}
                </a>
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">AI Model Benchmarks</h1>
          <p className="text-muted max-w-2xl text-sm">
            Live scores from the{" "}
            <a href="https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">
              HuggingFace Open LLM Leaderboard v2
            </a>
            . All models run on identical hardware with the same prompts &mdash; comparable &amp; reproducible. Click any row for details.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {COLUMNS.filter(c => !["rank","model","params","average"].includes(c.key)).map(c => (
            <div key={c.key} className="rounded-xl border border-border/30 bg-card/50 px-3 py-2">
              <p className="text-xs font-bold text-violet-500">{c.label}</p>
              <p className="text-[10px] text-muted mt-0.5 leading-tight">{c.title}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models or orgs&hellip;"
            className="w-full rounded-xl border border-border/40 bg-card/50 pl-9 pr-3 py-2 text-sm placeholder:text-muted focus:border-violet-500/60 focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Could not fetch live data</p>
              <p className="text-xs text-muted">{error}</p>
              <button onClick={fetchData} className="mt-2 text-xs text-violet-500 underline hover:no-underline">
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/5">
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      title={col.title}
                      onClick={() => handleSort(col.key as SortKey)}
                      className="px-3 py-3 text-left text-xs font-semibold text-muted cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && !data
                  ? Array.from({ length: 20 }).map((_, i) => <SkeletonRow key={i} />)
                  : sorted.length === 0
                  ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-3 py-12 text-center text-muted text-sm">
                        {search ? `No models match "${search}"` : "No data available"}
                      </td>
                    </tr>
                  )
                  : sorted.flatMap(m => {
                    const isSelected = selected?.fullName === m.fullName;
                    const rows = [
                      <tr
                        key={m.fullName}
                        onClick={() => setSelected(isSelected ? null : m)}
                        className={`border-b border-border/20 cursor-pointer transition-colors hover:bg-violet-500/5 ${isSelected ? "bg-violet-500/8" : ""}`}
                      >
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-mono text-muted">{m.rank}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="min-w-0">
                            {m.org && <span className="text-[10px] text-muted block leading-tight truncate">{m.org}</span>}
                            <span className="text-sm font-medium truncate block max-w-[220px]" title={m.model}>{m.model}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs text-muted font-mono">{formatParams(m.params)}</span>
                        </td>
                        <td className={`px-3 py-2.5 ${scoreBg(m.average)}`}>
                          <span className={`text-sm font-bold tabular-nums ${scoreColor(m.average)}`}>{m.average.toFixed(1)}</span>
                        </td>
                        {(["ifeval","bbh","math","gpqa","musr","mmlu_pro"] as const).map(bk => {
                          const v = m[bk];
                          return (
                            <td key={bk} className={`px-3 py-2.5 ${scoreBg(v)}`}>
                              <span className={`text-sm tabular-nums ${scoreColor(v)}`}>
                                {v !== null ? v.toFixed(1) : <span className="text-muted/30 text-xs">&mdash;</span>}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ];
                    if (isSelected) {
                      rows.push(
                        <tr key={`${m.fullName}-detail`} className="bg-violet-500/5 border-b border-violet-500/20">
                          <td colSpan={COLUMNS.length} className="px-5 py-4">
                            <div className="flex flex-wrap gap-4 text-xs">
                              <span><span className="text-muted">Full name: </span><code className="text-foreground">{m.fullName}</code></span>
                              {m.params && <span><span className="text-muted">Parameters: </span>{formatParams(m.params)}</span>}
                              {m.architecture && <span><span className="text-muted">Architecture: </span>{m.architecture}</span>}
                              {m.precision && <span><span className="text-muted">Precision: </span>{m.precision}</span>}
                              {m.license && <span><span className="text-muted">License: </span>{m.license}</span>}
                              <a
                                href={`https://huggingface.co/${m.fullName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-violet-500 hover:underline"
                                onClick={e => e.stopPropagation()}
                              >
                                View on HuggingFace <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    return rows;
                  })
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <span className="font-medium text-foreground text-xs mr-1">Score:</span>
          {[
            { label: "\u226590 Excellent", cls: "text-emerald-600 dark:text-emerald-400 font-bold" },
            { label: "\u226580 Strong",    cls: "text-green-600 dark:text-green-400 font-semibold" },
            { label: "\u226570 Good",      cls: "text-lime-600 dark:text-lime-400" },
            { label: "\u226560 Average",   cls: "text-yellow-600 dark:text-yellow-400" },
            { label: "<60 Weak",           cls: "text-orange-500" },
          ].map(s => <span key={s.label} className={s.cls}>{s.label}</span>)}
        </div>

        <div className="rounded-2xl border border-border/30 bg-card/30 px-5 py-4 flex gap-3">
          <Info className="h-4 w-4 text-muted shrink-0 mt-0.5" />
          <div className="text-xs text-muted leading-relaxed space-y-1">
            <p>
              Scores fetched live from{" "}
              <a href="https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">
                HuggingFace Open LLM Leaderboard v2
              </a>
              {" "}(4&times; A100 80&thinsp;GB, lm-evaluation-harness). New model submissions appear within days. Results cached 6&nbsp;hours.
            </p>
            <p>
              <strong className="text-foreground">Closed-source models</strong> (GPT-4o, Claude, Gemini) cannot be run on open evaluation infrastructure and are not listed here. For closed-model comparisons see{" "}
              <a href="https://lmarena.ai/?leaderboard" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">Chatbot Arena</a> or{" "}
              <a href="https://artificialanalysis.ai/leaderboards/models" target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">Artificial Analysis</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
