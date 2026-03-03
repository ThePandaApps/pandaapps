"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { PaletteColor } from "../types";
import { isLight } from "../types";

type CopyMode = "hex" | "rgb" | "hsl";

interface Props {
  color: PaletteColor;
  size?: "sm" | "md" | "lg";
}

export default function ColorCard({ color, size = "md" }: Props) {
  const [copied, setCopied] = useState<CopyMode | null>(null);

  const copy = async (mode: CopyMode) => {
    let text = "";
    if (mode === "hex") text = color.hex.toUpperCase();
    else if (mode === "rgb") text = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    else text = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
    await navigator.clipboard.writeText(text);
    setCopied(mode);
    setTimeout(() => setCopied(null), 1600);
  };

  const light = isLight(color.rgb);
  const fg    = light ? "text-black/70" : "text-white/90";
  const fgSub = light ? "text-black/40" : "text-white/50";
  const btnBg = light ? "hover:bg-black/10 active:bg-black/20" : "hover:bg-white/10 active:bg-white/20";

  const heights: Record<string, string> = {
    sm: "h-20",
    md: "h-32",
    lg: "h-44",
  };

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden border border-border/30 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
      {/* Swatch */}
      <div
        className={`relative flex-1 ${heights[size]} flex items-end p-3`}
        style={{ background: color.hex }}
      >
        {/* Copy HEX button (always visible) */}
        <button
          onClick={() => copy("hex")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold ${fg} ${btnBg} transition-colors`}
        >
          {copied === "hex" ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3 opacity-70" />
          )}
          {color.hex.toUpperCase()}
        </button>
      </div>

      {/* Detail row */}
      <div className="bg-card/80 px-3 py-2.5 space-y-1.5">
        <button
          onClick={() => copy("rgb")}
          className={`group/btn w-full flex items-center justify-between rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-card hover:text-foreground transition-colors`}
        >
          <span className="font-mono">
            rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
          </span>
          {copied === "rgb" ? (
            <Check className="h-3 w-3 text-purple-400 flex-shrink-0" />
          ) : (
            <Copy className="h-3 w-3 opacity-0 group-hover/btn:opacity-50 flex-shrink-0" />
          )}
        </button>

        <button
          onClick={() => copy("hsl")}
          className={`group/btn w-full flex items-center justify-between rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-card hover:text-foreground transition-colors`}
        >
          <span className="font-mono">
            hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
          </span>
          {copied === "hsl" ? (
            <Check className="h-3 w-3 text-purple-400 flex-shrink-0" />
          ) : (
            <Copy className="h-3 w-3 opacity-0 group-hover/btn:opacity-50 flex-shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
}
