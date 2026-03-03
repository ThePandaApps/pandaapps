import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Diff & Compare — PandaApps",
  description:
    "A powerful text comparison tool for developers. Side-by-side diff, word-level highlighting, order-independent comparison, extract-only-changes view, and unified patch export — all in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
