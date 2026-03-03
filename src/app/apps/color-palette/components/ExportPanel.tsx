"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import type { PaletteColor, ExportFormat } from "../types";
import { EXPORT_FORMAT_OPTIONS } from "../types";
import {
  buildCss, buildScss, buildTailwind, buildJson, buildSwatchPng,
} from "../palette";

interface Props {
  colors: PaletteColor[];
  paletteName: string;
}

export default function ExportPanel({ colors, paletteName }: Props) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);

  if (colors.length === 0) return null;

  const getText = (fmt: ExportFormat = format): string => {
    switch (fmt) {
      case "css":      return buildCss(colors, paletteName);
      case "scss":     return buildScss(colors, paletteName);
      case "tailwind": return buildTailwind(colors, paletteName);
      case "json":     return buildJson(colors, paletteName);
      default:         return "";
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(getText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const download = async () => {
    if (format === "swatch") {
      const dataUrl = await buildSwatchPng(colors, paletteName);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${paletteName.replace(/\s+/g, "_")}_swatch.png`;
      a.click();
    } else {
      const opt = EXPORT_FORMAT_OPTIONS.find((o) => o.value === format)!;
      const blob = new Blob([getText()], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${paletteName.replace(/\s+/g, "_")}.${opt.ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  const text = format !== "swatch" ? getText() : null;

  return (
    <div className="rounded-2xl border border-border/30 bg-card/20 overflow-hidden">
      {/* Format tabs */}
      <div className="flex items-center gap-1 border-b border-border/30 bg-card/30 px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted mr-2">Export as</span>
        <div className="flex flex-wrap gap-1">
          {EXPORT_FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFormat(opt.value)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                format === opt.value
                  ? "border-pink-500/40 bg-pink-500/10 text-pink-300"
                  : "border-border/40 bg-card/20 text-muted hover:bg-card/40 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-1.5">
          {format !== "swatch" && (
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-card/20 px-2.5 py-1 text-xs font-medium text-muted hover:bg-pink-500/10 hover:text-pink-300 hover:border-pink-500/30 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-pink-400" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </button>
          )}
          <button
            onClick={download}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-xs font-semibold text-white hover:opacity-90 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Code preview or swatch preview */}
      {format === "swatch" ? (
        <div className="p-6 flex items-center justify-center gap-0 overflow-x-auto">
          {colors.map((c, i) => (
            <div
              key={i}
              className="h-16 flex-1 min-w-12 first:rounded-l-xl last:rounded-r-xl"
              style={{ background: c.hex }}
              title={c.hex}
            />
          ))}
        </div>
      ) : (
        <pre className="overflow-x-auto p-4 text-[12px] font-mono text-muted leading-relaxed max-h-52 overflow-y-auto">
          {text}
        </pre>
      )}
    </div>
  );
}
