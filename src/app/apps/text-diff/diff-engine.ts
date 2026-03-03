import { diffLines, diffWords, diffChars, type Change } from "diff";

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */

export type CompareMode = "line" | "word" | "char";
export type ViewMode    = "split" | "unified" | "changes";
export type DiffPartType = "added" | "removed" | "unchanged";

export interface DiffPart {
  text: string;
  type: DiffPartType;
}

export type RowType = "added" | "removed" | "modified" | "unchanged" | "empty";

export interface DiffRow {
  type: RowType;
  leftNum:  number | null;
  rightNum: number | null;
  leftText:  string;
  rightText: string;
  /** Word/char-level parts for modified lines */
  leftParts?:  DiffPart[];
  rightParts?: DiffPart[];
}

export interface DiffStats {
  added:     number; // lines only on right
  removed:   number; // lines only on left
  modified:  number; // paired changed lines
  unchanged: number;
  similarity: number; // 0-100
}

export interface DiffResult {
  rows:         DiffRow[];
  stats:        DiffStats;
  isIdentical:  boolean;
  orderVariant: boolean; // same content, different order
  unifiedPatch: string;
}

export interface DiffOptions {
  compareMode:       CompareMode;
  ignoreWhitespace:  boolean;
  ignoreCase:        boolean;
  orderIndependent:  boolean;
  contextLines:      number; // for changes-only view
}

export const DEFAULT_OPTIONS: DiffOptions = {
  compareMode: "line",
  ignoreWhitespace: false,
  ignoreCase: false,
  orderIndependent: false,
  contextLines: 3,
};

/* ══════════════════════════════════════════════════════════════
   NORMALISE HELPERS
══════════════════════════════════════════════════════════════ */

function normalise(text: string, opts: DiffOptions): string {
  let t = text;
  if (opts.ignoreCase)       t = t.toLowerCase();
  if (opts.ignoreWhitespace) t = t.split("\n").map((l) => l.trim()).join("\n");
  return t;
}

function splitLines(text: string): string[] {
  return text.split("\n");
}

/* ══════════════════════════════════════════════════════════════
   INNER DIFF (word / char level)
══════════════════════════════════════════════════════════════ */

function innerDiff(
  left: string,
  right: string,
  mode: CompareMode
): { left: DiffPart[]; right: DiffPart[] } {
  const fn = mode === "char" ? diffChars : diffWords;
  const changes: Change[] = fn(left, right);

  const leftParts:  DiffPart[] = [];
  const rightParts: DiffPart[] = [];

  for (const c of changes) {
    if (c.removed) {
      leftParts.push({ text: c.value, type: "removed" });
    } else if (c.added) {
      rightParts.push({ text: c.value, type: "added" });
    } else {
      leftParts.push({ text: c.value, type: "unchanged" });
      rightParts.push({ text: c.value, type: "unchanged" });
    }
  }

  return { left: leftParts, right: rightParts };
}

/* ══════════════════════════════════════════════════════════════
   MAIN DIFF ENGINE
══════════════════════════════════════════════════════════════ */

export function computeDiff(
  rawLeft: string,
  rawRight: string,
  opts: DiffOptions
): DiffResult {
  /* ── Order-independent pre-pass ───────────────────────────── */
  let orderVariant = false;
  let left  = rawLeft;
  let right = rawRight;

  if (opts.orderIndependent) {
    const sortedL = splitLines(normalise(rawLeft, opts)).sort().join("\n");
    const sortedR = splitLines(normalise(rawRight, opts)).sort().join("\n");
    orderVariant  = sortedL === sortedR && rawLeft !== rawRight;
    left  = splitLines(rawLeft).sort().join("\n");
    right = splitLines(rawRight).sort().join("\n");
  }

  const normL = normalise(left, opts);
  const normR = normalise(right, opts);
  const isIdentical = normL === normR;

  /* ── Run Myers line diff ──────────────────────────────────── */
  const changes: Change[] = diffLines(normL, normR, {
    newlineIsToken: false,
    ignoreWhitespace: opts.ignoreWhitespace,
  });

  /* ── Build row pairs ──────────────────────────────────────── */
  const rows: DiffRow[] = [];
  let leftNum  = 1;
  let rightNum = 1;

  // Group consecutive removed/added into "modified" pairs
  const grouped: Array<Change | [Change, Change]> = [];
  for (let i = 0; i < changes.length; i++) {
    const cur  = changes[i];
    const next = changes[i + 1];
    if (cur.removed && next?.added) {
      grouped.push([cur, next]);
      i++;
    } else {
      grouped.push(cur);
    }
  }

  for (const item of grouped) {
    if (Array.isArray(item)) {
      /* ── Modified pair ── */
      const [removed, added] = item;
      const removedLines = splitLines(removed.value).filter((_, i, a) => i < a.length - 1 || _);
      const addedLines   = splitLines(added.value).filter((_, i, a)   => i < a.length - 1 || _);
      // Remove trailing empty string caused by trailing newline
      if (removedLines[removedLines.length - 1] === "") removedLines.pop();
      if (addedLines[addedLines.length - 1]   === "") addedLines.pop();

      const maxLen = Math.max(removedLines.length, addedLines.length);
      for (let i = 0; i < maxLen; i++) {
        const lText = removedLines[i] ?? "";
        const rText = addedLines[i]   ?? "";

        if (i < removedLines.length && i < addedLines.length) {
          // both sides — modified row
          const { left: lp, right: rp } = innerDiff(
            opts.ignoreCase ? lText.toLowerCase() : lText,
            opts.ignoreCase ? rText.toLowerCase() : rText,
            opts.compareMode
          );
          rows.push({
            type: "modified",
            leftNum:  leftNum++,
            rightNum: rightNum++,
            leftText:  lText,
            rightText: rText,
            leftParts:  lp,
            rightParts: rp,
          });
        } else if (i < removedLines.length) {
          rows.push({ type: "removed", leftNum: leftNum++, rightNum: null, leftText: lText, rightText: "" });
        } else {
          rows.push({ type: "added", leftNum: null, rightNum: rightNum++, leftText: "", rightText: rText });
        }
      }
    } else {
      const c = item;
      const lines = splitLines(c.value);
      if (lines[lines.length - 1] === "") lines.pop();

      for (const line of lines) {
        if (c.added) {
          rows.push({ type: "added",   leftNum: null,       rightNum: rightNum++, leftText: "",   rightText: line });
        } else if (c.removed) {
          rows.push({ type: "removed", leftNum: leftNum++,  rightNum: null,       leftText: line, rightText: ""  });
        } else {
          rows.push({ type: "unchanged", leftNum: leftNum++, rightNum: rightNum++, leftText: line, rightText: line });
        }
      }
    }
  }

  /* ── Stats ────────────────────────────────────────────────── */
  const stats: DiffStats = { added: 0, removed: 0, modified: 0, unchanged: 0, similarity: 0 };
  for (const r of rows) {
    if      (r.type === "added")     stats.added++;
    else if (r.type === "removed")   stats.removed++;
    else if (r.type === "modified")  stats.modified++;
    else if (r.type === "unchanged") stats.unchanged++;
  }
  const total = stats.added + stats.removed + stats.modified + stats.unchanged;
  stats.similarity = total === 0 ? 100 : Math.round((stats.unchanged / total) * 100);

  /* ── Unified patch ────────────────────────────────────────── */
  const unifiedPatch = buildUnifiedPatch(rows, opts.contextLines);

  return { rows, stats, isIdentical, orderVariant, unifiedPatch };
}

/* ══════════════════════════════════════════════════════════════
   UNIFIED PATCH BUILDER
══════════════════════════════════════════════════════════════ */

function buildUnifiedPatch(rows: DiffRow[], contextLines: number): string {
  const lines: string[] = ["--- original", "+++ modified", ""];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    if (row.type === "unchanged") { i++; continue; }

    // Found a change — collect context window
    const start  = Math.max(0, i - contextLines);
    const end    = Math.min(rows.length, i + contextLines + 1);
    // Extend end to cover consecutive changes
    let j = i;
    while (j < rows.length && rows[j].type !== "unchanged") j++;
    const extEnd = Math.min(rows.length, j + contextLines);

    const chunk  = rows.slice(start, extEnd);
    const leftStart  = chunk.find((r) => r.leftNum  != null)?.leftNum  ?? 0;
    const rightStart = chunk.find((r) => r.rightNum != null)?.rightNum ?? 0;
    const leftCount  = chunk.filter((r) => r.leftNum  != null).length;
    const rightCount = chunk.filter((r) => r.rightNum != null).length;

    lines.push(`@@ -${leftStart},${leftCount} +${rightStart},${rightCount} @@`);
    for (const r of chunk) {
      if      (r.type === "unchanged") lines.push(` ${r.leftText}`);
      else if (r.type === "removed")   lines.push(`-${r.leftText}`);
      else if (r.type === "added")     lines.push(`+${r.rightText}`);
      else if (r.type === "modified") {
        lines.push(`-${r.leftText}`);
        lines.push(`+${r.rightText}`);
      }
    }

    i = extEnd;
  }
  return lines.join("\n");
}
