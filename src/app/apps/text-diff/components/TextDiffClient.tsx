"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ArrowLeftRight, Copy, Check, Download, GitCompare,
  Trash2, ChevronDown, Eye, Columns2, List, RefreshCw,
  Info, Shuffle,
} from "lucide-react";
import {
  computeDiff, DEFAULT_OPTIONS,
  type DiffOptions, type DiffRow, type DiffPart,
  type CompareMode, type ViewMode,
} from "../diff-engine";

/* ══════════════════════════════════════════════════════════════
   SAMPLE TEXTS
══════════════════════════════════════════════════════════════ */
const SAMPLE_LEFT = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const TAX_RATE = 0.08;

function applyDiscount(price, discount) {
  return price - discount;
}

// Format as currency
function formatPrice(value) {
  return "$" + value.toFixed(2);
}`;

const SAMPLE_RIGHT = `function calculateTotal(items, includesTax = false) {
  let total = items.reduce((sum, item) => sum + item.price, 0);
  if (includesTax) {
    total *= (1 + TAX_RATE);
  }
  return parseFloat(total.toFixed(2));
}

const TAX_RATE = 0.1;

function applyDiscount(price, discount, isPercent = false) {
  if (isPercent) return price * (1 - discount / 100);
  return price - discount;
}

// Format as localised currency string
function formatPrice(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}`;

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const VIEW_MODES: { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "split",   label: "Split",   icon: Columns2 },
  { id: "unified", label: "Unified", icon: List     },
  { id: "changes", label: "Changes", icon: Eye      },
];

const COMPARE_MODES: { id: CompareMode; label: string; desc: string }[] = [
  { id: "line", label: "Line",      desc: "Line-by-line with word highlights within changes" },
  { id: "word", label: "Word",      desc: "Word-by-word tokenised diff"                      },
  { id: "char", label: "Character", desc: "Character-level granularity"                      },
];

/* ══════════════════════════════════════════════════════════════
   ROW COLORS (dark theme)
══════════════════════════════════════════════════════════════ */
const ROW_BG: Record<string, string> = {
  added_right:    "bg-green-950/70",
  removed_left:   "bg-red-950/70",
  modified_left:  "bg-red-950/50",
  modified_right: "bg-blue-950/50",
  unchanged:      "",
  empty:          "bg-[#0a0a0d]",
};

const PART_BG: Record<string, string> = {
  removed:   "bg-red-500/40 rounded-sm",
  added:     "bg-green-500/40 rounded-sm",
  unchanged: "",
};

/* ══════════════════════════════════════════════════════════════
   INLINE RENDERING HELPERS
══════════════════════════════════════════════════════════════ */
function Parts({ parts, side }: { parts?: DiffPart[]; side: "left" | "right" }) {
  if (!parts) return null;
  return (
    <>
      {parts.map((p, i) => (
        <span
          key={i}
          className={p.type === "unchanged" ? "" : side === "left"
            ? "bg-red-500/45 rounded-sm"
            : "bg-emerald-500/45 rounded-sm"
          }
        >
          {p.text}
        </span>
      ))}
    </>
  );
}

function LineNum({ n }: { n: number | null }) {
  return (
    <span className="inline-block w-10 flex-shrink-0 select-none text-right pr-3 text-[11px] text-muted/40 font-mono border-r border-border/20 mr-3">
      {n ?? ""}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function TextDiffClient() {
  const [leftText,  setLeftText]  = useState(SAMPLE_LEFT);
  const [rightText, setRightText] = useState(SAMPLE_RIGHT);
  const [options, setOptions]     = useState<DiffOptions>(DEFAULT_OPTIONS);
  const [viewMode, setViewMode]   = useState<ViewMode>("split");
  const [diffResult, setDiffResult] = useState(() =>
    computeDiff(SAMPLE_LEFT, SAMPLE_RIGHT, DEFAULT_OPTIONS)
  );
  const [copied, setCopied]       = useState<"patch" | "left" | "right" | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auto-recompute diff on any change (debounced) */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDiffResult(computeDiff(leftText, rightText, options));
    }, 240);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [leftText, rightText, options]);

  const updateOpt = (patch: Partial<DiffOptions>) =>
    setOptions((p) => ({ ...p, ...patch }));

  const swap = () => {
    setLeftText(rightText);
    setRightText(leftText);
  };

  const clear = () => { setLeftText(""); setRightText(""); };

  const loadSample = () => { setLeftText(SAMPLE_LEFT); setRightText(SAMPLE_RIGHT); };

  const copy = async (what: "patch" | "left" | "right") => {
    const text = what === "patch" ? diffResult.unifiedPatch
                : what === "left"  ? leftText : rightText;
    await navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1600);
  };

  const downloadPatch = () => {
    const blob = new Blob([diffResult.unifiedPatch], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "diff.patch";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const { rows, stats, isIdentical, orderVariant } = diffResult;

  /* ── Filter rows for "changes only" view ────────────────── */
  const visibleRows = viewMode === "changes"
    ? filterWithContext(rows, options.contextLines)
    : rows;

  const isEmpty = !leftText && !rightText;

  return (
    <div className="flex flex-col min-h-screen">

      {/* ══════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 border-b border-border/30 bg-[#09090b]/90 backdrop-blur-sm px-4 py-2.5">
        <div className="mx-auto max-w-[1400px] flex items-center gap-3 flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <GitCompare className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground hidden sm:block">Text Diff</span>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border/40 bg-card/20 p-0.5">
            {VIEW_MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === id
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Compare mode */}
          <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-card/20 p-0.5">
            {COMPARE_MODES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => updateOpt({ compareMode: id })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  options.compareMode === id
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Quick toggles */}
          <div className="flex items-center gap-1">
            <ToggleBtn
              active={options.ignoreWhitespace}
              onClick={() => updateOpt({ ignoreWhitespace: !options.ignoreWhitespace })}
              label="±Spaces"
              title="Ignore whitespace"
            />
            <ToggleBtn
              active={options.ignoreCase}
              onClick={() => updateOpt({ ignoreCase: !options.ignoreCase })}
              label="Aa"
              title="Ignore case"
            />
            <ToggleBtn
              active={options.orderIndependent}
              onClick={() => updateOpt({ orderIndependent: !options.orderIndependent })}
              label="⇅ Order"
              title="Order-independent comparison (sorts lines before comparing)"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            <HeaderBtn onClick={loadSample} title="Load sample code">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sample</span>
            </HeaderBtn>
            <HeaderBtn onClick={swap} title="Swap left and right">
              <Shuffle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Swap</span>
            </HeaderBtn>
            <HeaderBtn onClick={clear} title="Clear both panels">
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </HeaderBtn>
            <div className="w-px h-4 bg-border/40 mx-0.5" />
            <HeaderBtn onClick={() => copy("patch")} title="Copy unified diff patch">
              {copied === "patch" ? <Check className="h-3.5 w-3.5 text-violet-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Copy Patch</span>
            </HeaderBtn>
            <HeaderBtn onClick={downloadPatch} title="Download .patch file">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">.patch</span>
            </HeaderBtn>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] flex-1 flex flex-col gap-0">

        {/* ══════════════════════════════════════════════════
            INPUT PANELS
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-border/30">
          <InputPane
            label="Original"
            value={leftText}
            onChange={setLeftText}
            badgeColor="text-red-400"
            onCopy={() => copy("left")}
            copied={copied === "left"}
            placeholder="Paste or type your original text here…"
          />
          <div className="hidden sm:block border-l border-border/30" />
          <InputPane
            label="Modified"
            value={rightText}
            onChange={setRightText}
            badgeColor="text-emerald-400"
            onCopy={() => copy("right")}
            copied={copied === "right"}
            placeholder="Paste or type your modified text here…"
          />
        </div>

        {/* ══════════════════════════════════════════════════
            STATS BAR
        ══════════════════════════════════════════════════ */}
        {!isEmpty && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-border/20 bg-card/20 text-xs">
            {isIdentical ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="h-3.5 w-3.5" /> Identical
              </span>
            ) : orderVariant ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Shuffle className="h-3.5 w-3.5" /> Same content, different order
              </span>
            ) : null}
            <Stat color="text-emerald-400" value={stats.added}     label="added"     />
            <Stat color="text-red-400"     value={stats.removed}   label="removed"   />
            <Stat color="text-blue-400"    value={stats.modified}  label="modified"  />
            <Stat color="text-muted"       value={stats.unchanged} label="unchanged" />
            <div className="ml-auto flex items-center gap-2">
              <span className="text-muted">Similarity</span>
              <SimilarityBar pct={stats.similarity} />
              <span className={`font-semibold ${
                stats.similarity >= 80 ? "text-emerald-400" :
                stats.similarity >= 50 ? "text-amber-400" : "text-red-400"
              }`}>
                {stats.similarity}%
              </span>
            </div>
            {/* Context lines (changes-only mode) */}
            {viewMode === "changes" && (
              <div className="flex items-center gap-2 ml-2 border-l border-border/30 pl-2">
                <span className="text-muted">Context:</span>
                {[0, 1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateOpt({ contextLines: n })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      options.contextLines === n
                        ? "bg-violet-500/20 text-violet-300"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            DIFF OUTPUT
        ══════════════════════════════════════════════════ */}
        {isEmpty ? (
          <EmptyState onSample={loadSample} />
        ) : isIdentical && !orderVariant ? (
          <IdenticalState />
        ) : (
          <div className="overflow-auto font-mono text-[13px] leading-6 flex-1">
            {viewMode === "split" ? (
              <SplitView rows={visibleRows} />
            ) : (
              <UnifiedView rows={visibleRows} viewMode={viewMode} />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SPLIT VIEW
══════════════════════════════════════════════════════════════ */
function SplitView({ rows }: { rows: Array<DiffRow | "separator"> }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-border/20 min-w-[600px]">
      {/* Left header */}
      <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-red-400/70 bg-red-950/20 border-b border-border/20">
        Original
      </div>
      <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-400/70 bg-emerald-950/20 border-b border-border/20">
        Modified
      </div>

      {rows.map((row, i) => {
        if (row === "separator") {
          return (
            <>
              <div key={`sep-l-${i}`} className="flex items-center gap-2 px-4 py-1 bg-violet-950/20 border-y border-violet-500/20 col-span-1">
                <span className="text-[10px] text-violet-400/70 select-none">···</span>
              </div>
              <div key={`sep-r-${i}`} className="flex items-center gap-2 px-4 py-1 bg-violet-950/20 border-y border-violet-500/20 col-span-1">
                <span className="text-[10px] text-violet-400/70 select-none">···</span>
              </div>
            </>
          );
        }
        return (
        <>
          {/* LEFT cell */}
          <div
            key={`l-${i}`}
            className={`flex items-start px-2 py-0.5 min-h-[24px] ${
              row.type === "added"   ? ROW_BG.empty :
              row.type === "removed" ? ROW_BG.removed_left :
              row.type === "modified"? ROW_BG.modified_left : ""
            }`}
          >
            <LineNum n={row.leftNum} />
            <span className={`whitespace-pre-wrap break-all flex-1 ${
              row.type === "removed"  ? "text-red-200" :
              row.type === "modified" ? "text-red-100/90" : "text-foreground/80"
            }`}>
              {row.type === "added" ? "" :
               row.type === "modified" && row.leftParts
                 ? <Parts parts={row.leftParts} side="left" />
                 : row.leftText}
            </span>
            {row.type === "removed"  && <span className="flex-shrink-0 ml-1 text-red-500/60 text-[10px] select-none">−</span>}
            {row.type === "modified" && <span className="flex-shrink-0 ml-1 text-red-500/60 text-[10px] select-none">~</span>}
          </div>

          {/* RIGHT cell */}
          <div
            key={`r-${i}`}
            className={`flex items-start px-2 py-0.5 min-h-[24px] ${
              row.type === "removed" ? ROW_BG.empty :
              row.type === "added"   ? ROW_BG.added_right :
              row.type === "modified"? ROW_BG.modified_right : ""
            }`}
          >
            <LineNum n={row.rightNum} />
            <span className={`whitespace-pre-wrap break-all flex-1 ${
              row.type === "added"    ? "text-emerald-200" :
              row.type === "modified" ? "text-blue-100/90" : "text-foreground/80"
            }`}>
              {row.type === "removed" ? "" :
               row.type === "modified" && row.rightParts
                 ? <Parts parts={row.rightParts} side="right" />
                 : row.rightText}
            </span>
            {row.type === "added"    && <span className="flex-shrink-0 ml-1 text-emerald-500/60 text-[10px] select-none">+</span>}
            {row.type === "modified" && <span className="flex-shrink-0 ml-1 text-blue-500/60 text-[10px] select-none">~</span>}
          </div>
        </>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   UNIFIED / CHANGES VIEW
══════════════════════════════════════════════════════════════ */
function UnifiedView({ rows, viewMode }: { rows: Array<DiffRow | "separator">; viewMode: ViewMode }) {
  return (
    <div className="min-w-[400px]">
      <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-violet-400/70 bg-violet-950/20 border-b border-border/20">
        {viewMode === "changes" ? "Changes Only" : "Unified Diff"}
      </div>

      {rows.map((row, i) => {
        if (row === "separator") {
          return (
            <div key={i} className="flex items-center gap-2 px-4 py-1 bg-violet-950/20 border-y border-violet-500/20">
              <span className="text-[10px] text-violet-400/70 select-none">···</span>
            </div>
          );
        }

        const prefix =
          row.type === "added"    ? "+" :
          row.type === "removed"  ? "−" :
          row.type === "modified" ? "~" : " ";

        const bg =
          row.type === "added"    ? "bg-green-950/70" :
          row.type === "removed"  ? "bg-red-950/70" :
          row.type === "modified" ? "bg-violet-950/50" : "";

        const textColor =
          row.type === "added"    ? "text-emerald-200" :
          row.type === "removed"  ? "text-red-200" :
          row.type === "modified" ? "text-violet-200" : "text-foreground/75";

        const prefixColor =
          row.type === "added"    ? "text-emerald-500" :
          row.type === "removed"  ? "text-red-500" :
          row.type === "modified" ? "text-violet-400" : "text-muted/30";

        if (row.type === "modified") {
          return (
            <>
              <div key={`m-l-${i}`} className={`flex items-start px-2 py-0.5 bg-red-950/60`}>
                <span className={`w-5 flex-shrink-0 font-bold select-none ${prefixColor} text-red-500`}>−</span>
                <LineNum n={row.leftNum} />
                <span className={`whitespace-pre-wrap break-all flex-1 text-red-200`}>
                  {row.leftParts ? <Parts parts={row.leftParts} side="left" /> : row.leftText}
                </span>
              </div>
              <div key={`m-r-${i}`} className={`flex items-start px-2 py-0.5 bg-emerald-950/60`}>
                <span className={`w-5 flex-shrink-0 font-bold select-none text-emerald-500`}>+</span>
                <LineNum n={row.rightNum} />
                <span className={`whitespace-pre-wrap break-all flex-1 text-emerald-200`}>
                  {row.rightParts ? <Parts parts={row.rightParts} side="right" /> : row.rightText}
                </span>
              </div>
            </>
          );
        }

        return (
          <div key={i} className={`flex items-start px-2 py-0.5 min-h-[24px] ${bg}`}>
            <span className={`w-5 flex-shrink-0 font-bold select-none ${prefixColor}`}>{prefix}</span>
            <LineNum n={row.type === "added" ? row.rightNum : row.leftNum} />
            <span className={`whitespace-pre-wrap break-all flex-1 ${textColor}`}>
              {row.type === "added" ? row.rightText
               : row.type === "removed" ? row.leftText
               : row.leftText}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONTEXT FILTER (changes-only mode)
══════════════════════════════════════════════════════════════ */
function filterWithContext(
  rows: DiffRow[],
  context: number
): Array<DiffRow | "separator"> {
  if (rows.length === 0) return [];

  const changed = new Set<number>();
  rows.forEach((r, i) => {
    if (r.type !== "unchanged") {
      for (let j = Math.max(0, i - context); j <= Math.min(rows.length - 1, i + context); j++) {
        changed.add(j);
      }
    }
  });

  const result: Array<DiffRow | "separator"> = [];
  let lastIncluded = -1;

  rows.forEach((r, i) => {
    if (changed.has(i)) {
      if (lastIncluded >= 0 && i > lastIncluded + 1) result.push("separator");
      result.push(r);
      lastIncluded = i;
    }
  });

  return result;
}

/* ══════════════════════════════════════════════════════════════
   INPUT PANE
══════════════════════════════════════════════════════════════ */
function InputPane({
  label, value, onChange, badgeColor, onCopy, copied, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  badgeColor: string;
  onCopy: () => void;
  copied: boolean;
  placeholder: string;
}) {
  const lines = value.split("\n").length;
  return (
    <div className="flex flex-col min-h-[180px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-card/20">
        <span className={`text-xs font-semibold uppercase tracking-widest ${badgeColor}`}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted">{lines} line{lines !== 1 ? "s" : ""}</span>
          <button
            onClick={onCopy}
            className="text-muted hover:text-foreground transition-colors"
            title={`Copy ${label}`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-violet-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="flex-1 min-h-[160px] resize-y bg-transparent p-3 font-mono text-sm text-foreground/90 placeholder-muted/40 focus:outline-none leading-6"
        style={{ tabSize: 2 }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SMALL UI HELPERS
══════════════════════════════════════════════════════════════ */
function ToggleBtn({
  active, onClick, label, title,
}: {
  active: boolean; onClick: () => void; label: string; title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
        active
          ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
          : "border-border/40 bg-card/20 text-muted hover:text-foreground hover:bg-card/40"
      }`}
    >
      {label}
    </button>
  );
}

function HeaderBtn({
  onClick, title, children,
}: {
  onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/20 px-2.5 py-1 text-xs font-medium text-muted hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/30 transition-all"
    >
      {children}
    </button>
  );
}

function Stat({ color, value, label }: { color: string; value: number; label: string }) {
  if (value === 0) return null;
  return (
    <span className={`flex items-center gap-1 font-semibold ${color}`}>
      <span>{label === "added" ? "+" : label === "removed" ? "−" : label === "modified" ? "~" : "="}</span>
      <span>{value}</span>
      <span className="font-normal text-muted">{label}</span>
    </span>
  );
}

function SimilarityBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-20 h-1.5 rounded-full bg-border/40 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function EmptyState({ onSample }: { onSample: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
      <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
        <GitCompare className="h-6 w-6 text-violet-400" />
      </div>
      <div>
        <p className="text-foreground font-semibold mb-1">Paste text into both panels to start comparing</p>
        <p className="text-muted text-sm">Supports code, prose, JSON, CSV, configs — anything text.</p>
      </div>
      <button
        onClick={onSample}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-indigo-500/10 border border-violet-500/30 px-4 py-2 text-sm font-semibold text-violet-300 hover:opacity-90 transition-all"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Load sample JavaScript diff
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 max-w-xl text-left">
        {[
          { icon: "⇅", title: "Order-independent", desc: "Enable to detect same content in different order" },
          { icon: "🔍", title: "Word & char level", desc: "Exactly which words or characters changed, not just lines" },
          { icon: "📋", title: "Export patch", desc: "Copy or download as a standard .patch / unified diff file" },
        ].map((tip) => (
          <div key={tip.title} className="rounded-xl border border-border/30 bg-card/20 p-3">
            <p className="text-sm font-semibold text-foreground mb-0.5">{tip.icon} {tip.title}</p>
            <p className="text-[11px] text-muted">{tip.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdenticalState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
        <Check className="h-5 w-5 text-emerald-400" />
      </div>
      <p className="text-emerald-400 font-semibold text-lg">Texts are identical</p>
      <p className="text-muted text-sm">No differences found with the current comparison settings.</p>
    </div>
  );
}
