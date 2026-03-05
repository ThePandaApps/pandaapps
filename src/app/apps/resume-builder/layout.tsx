import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder — Panda Apps",
  description:
    "Build a professional resume in minutes. 4 modern templates, real-time preview, PDF & JSON download. 100% free, no sign-up, runs entirely in your browser.",
};

export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
