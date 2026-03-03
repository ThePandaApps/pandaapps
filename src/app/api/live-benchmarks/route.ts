import { NextResponse } from "next/server";

// HuggingFace Datasets Server API – Open LLM Leaderboard v2
// Public, no auth required. Returns models + 6 standardized benchmark scores.
// Columns: IFEval | BBH | Math Lvl 5 | GPQA | MUSR | MMLU-PRO | Average
const HF_DATASET_API =
  "https://datasets-server.huggingface.co/rows?" +
  "dataset=open-llm-leaderboard%2Fcontents" +
  "&config=default&split=train&offset=0&length=500";

export interface LiveModel {
  rank: number;
  fullName: string;       // e.g. "mistralai/Mixtral-8x22B"
  shortName: string;      // org/model split
  org: string;
  model: string;
  type: string;           // "🟢 instruction" | "🔵 pretrained" etc
  params: string | null;  // "7.6" (billion)
  average: number;        // 0-100
  ifeval: number | null;
  bbh: number | null;
  math: number | null;
  gpqa: number | null;
  musr: number | null;
  mmlu_pro: number | null;
  architecture: string | null;
  precision: string | null;
  license: string | null;
}

export interface LiveBenchmarkResponse {
  models: LiveModel[];
  fetchedAt: string;
  source: string;
  sourceUrl: string;
  total: number;
}

function parseNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : parseFloat(n.toFixed(2));
}

function cleanModelName(full: string): { org: string; model: string; short: string } {
  const parts = full.split("/");
  if (parts.length >= 2) {
    return { org: parts[0], model: parts.slice(1).join("/"), short: full };
  }
  return { org: "", model: full, short: full };
}

export async function GET() {
  try {
    const res = await fetch(HF_DATASET_API, {
      headers: { Accept: "application/json" },
      next: { revalidate: 21600 }, // cache 6 hours server-side
    });

    if (!res.ok) {
      throw new Error(`HuggingFace API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const rows = (data.rows ?? []) as Array<{ row: Record<string, unknown>; row_idx: number }>;

    const models: LiveModel[] = rows
      .map(({ row }, idx) => {
        const avg = parseNum(row["Average"]);
        if (avg === null || avg <= 0) return null;

        const fullName = String(row["fullname"] ?? row["model"] ?? "unknown");
        const { org, model } = cleanModelName(fullName);

        // Params field: "#Params (B)" or "Params"
        const rawParams =
          row["#Params (B)"] ?? row["Params"] ?? row["num_params"] ?? null;
        const paramsStr =
          rawParams !== null && rawParams !== undefined
            ? String(rawParams).replace(/[^0-9.]/g, "") || null
            : null;

        // Type emoji mapping
        const rawType = String(row["Type"] ?? row["type"] ?? "");
        const typeClean = rawType.replace(/[^\w\s]/gu, "").trim() || rawType.trim();

        return {
          rank: idx + 1,
          fullName,
          shortName: fullName,
          org,
          model,
          type: typeClean || "open",
          params: paramsStr,
          average: avg,
          ifeval: parseNum(row["IFEval"]),
          bbh: parseNum(row["BBH"]),
          math: parseNum(row["Math Lvl 5"] ?? row["Math_Lvl_5"] ?? row["MATH"]),
          gpqa: parseNum(row["GPQA"]),
          musr: parseNum(row["MUSR"] ?? row["MuSR"]),
          mmlu_pro: parseNum(row["MMLU-PRO"] ?? row["MMLU_PRO"] ?? row["MMLU Pro"]),
          architecture: row["Architecture"] ? String(row["Architecture"]) : null,
          precision: row["Precision"] ? String(row["Precision"]) : null,
          license: row["License"] ? String(row["License"]) : null,
        } satisfies LiveModel;
      })
      .filter((m): m is LiveModel => m !== null)
      .sort((a, b) => b.average - a.average)
      .map((m, i) => ({ ...m, rank: i + 1 }));

    const response: LiveBenchmarkResponse = {
      models: models.slice(0, 50),
      fetchedAt: new Date().toISOString(),
      source: "HuggingFace Open LLM Leaderboard v2",
      sourceUrl:
        "https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard",
      total: models.length,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err), models: [], fetchedAt: new Date().toISOString() },
      { status: 500 }
    );
  }
}
