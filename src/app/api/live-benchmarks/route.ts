import { NextResponse } from "next/server";
import { MODELS, BENCHMARK_SOURCES, DATA_DATE } from "@/app/apps/ai-benchmarks/data/frontierData";
export type { BenchmarkModel } from "@/app/apps/ai-benchmarks/data/frontierData";

export async function GET() {
  return NextResponse.json(
    { models: MODELS, sources: BENCHMARK_SOURCES, lastUpdated: DATA_DATE },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } }
  );
}
