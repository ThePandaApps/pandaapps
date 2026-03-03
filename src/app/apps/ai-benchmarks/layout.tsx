import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Model Benchmarks — Panda Apps",
  description:
    "Compare the latest AI models across 18 benchmarks — reasoning, math, coding, knowledge, multimodal, and instruction following. Scores from official technical reports and peer-reviewed leaderboards.",
};

export default function AIBenchmarksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
