"use client";

import { EXPORT_FORMATS } from "../types";
import type { QrConfig, ExportFormat } from "../types";
import { Download, Copy, Check, Share2 } from "lucide-react";
import { useState, useCallback } from "react";

interface Props {
  config: QrConfig;
  onChange: (c: Partial<QrConfig>) => void;
  qrRef: React.RefObject<{ download: (ext: string) => void } | null>;
}

export default function ExportPanel({ config, onChange, qrRef }: Props) {
  const [copied, setCopied] = useState(false);

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;
    qrRef.current.download(config.exportFormat);
  }, [config.exportFormat, qrRef]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!qrRef.current) return;
    try {
      // Get canvas element from the qr container
      const container = document.getElementById("qr-preview-container");
      const canvas = container?.querySelector("canvas");
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: try downloading instead
      handleDownload();
    }
  }, [handleDownload]);

  const handleShare = useCallback(async () => {
    const container = document.getElementById("qr-preview-container");
    const canvas = container?.querySelector("canvas");
    if (!canvas || !navigator.share) return;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return;

    const file = new File([blob], `qr-code.png`, { type: "image/png" });

    try {
      await navigator.share({
        files: [file],
        title: "QR Code",
        text: "Generated with Panda Apps",
      });
    } catch {
      // User cancelled share
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Format selector ── */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
          Export Format
        </label>
        <div className="grid grid-cols-4 gap-2">
          {EXPORT_FORMATS.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() =>
                onChange({ exportFormat: fmt.value as ExportFormat })
              }
              className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                config.exportFormat === fmt.value
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-border/40 bg-card/20 text-muted hover:bg-card/40"
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-black hover:bg-accent-light transition-colors shadow-lg shadow-accent/20 active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Download {config.exportFormat.toUpperCase()}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/30 py-3 text-xs font-medium text-muted hover:text-foreground hover:bg-card/50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-accent" />
                <span className="text-accent">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Image
              </>
            )}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/30 py-3 text-xs font-medium text-muted hover:text-foreground hover:bg-card/50 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
