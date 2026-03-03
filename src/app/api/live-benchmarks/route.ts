import { NextResponse } from "next/server";
import { BENCHMARK_SOURCES, DATA_DATE } from "@/app/apps/ai-benchmarks/data/frontierData";
import { fetchFreshModels } from "@/app/apps/ai-benchmarks/data/liveDataFetcher";
export type { BenchmarkModel } from "@/app/apps/ai-benchmarks/data/frontierData";

export const revalidate = 86400;

export async function GET() {
  const models = await fetchFreshModels();
  return NextResponse.json(
    { models, sources: BENCHMARK_SOURCES, lastUpdated: DATA_DATE },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } }
  );
}
