import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator — Panda Apps",
  description:
    "Generate beautiful, customizable QR codes with custom colors, logos, dot styles, and export in PNG, SVG, JPEG, and WebP. Free and private — your data never leaves your browser.",
  keywords: [
    "qr code generator",
    "custom qr code",
    "qr code with logo",
    "free qr code",
  ],
};

export default function QrGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
