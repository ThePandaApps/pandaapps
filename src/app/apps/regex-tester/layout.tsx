import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester — PandaApps",
  description:
    "Test and debug regular expressions in real-time. Live match highlighting, capture groups, replace mode, and a quick-reference pattern library. Everything runs in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
