import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Palette Generator — PandaApps",
  description:
    "Extract stunning color palettes from any image, generate color harmonies, or explore curated presets. Export as CSS variables, Tailwind config, SCSS, JSON, or PNG swatch — free and instant.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
