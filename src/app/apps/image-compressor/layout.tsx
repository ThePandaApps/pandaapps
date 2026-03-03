import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor — Panda Apps",
  description:
    "Compress JPEG, PNG, WebP, and AVIF images with intelligent algorithms. Batch processing, no quality loss, 100% free — your images never leave your device and are never uploaded to any server.",
  keywords: ["image compressor", "compress images", "webp converter", "reduce image size"],
};

export default function ImageCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
