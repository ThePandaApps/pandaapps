import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Editor — PandaApps",
  description:
    "A beautiful live Markdown editor with split-pane preview, formatting toolbar, auto-save, and one-click export to HTML, Markdown, or PDF. Everything stays in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
