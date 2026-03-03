import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Currency Converter — Panda Apps",
  description:
    "Convert between 170+ currencies with live exchange rates. Fast, free, and private — no sign-up required.",
};

export default function CurrencyConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
