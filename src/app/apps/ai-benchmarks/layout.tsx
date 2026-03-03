import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Model Benchmarks — Panda Apps",
  description:
    "Compare 20 frontier AI models across 5 key benchmarks with interactive charts — GPQA Diamond, SWE-bench, ARC-AGI 2, Arena ELO, and AA Intelligence Index. Auto-updated daily.",
};

export default function AIBenchmarksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
