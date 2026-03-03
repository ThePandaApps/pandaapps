"use client";

import { Download, X, Loader2, AlertCircle, CheckCircle2, ImageIcon } from "lucide-react";
import { formatBytes, savingsPercent } from "../types";
import type { CompressedFile } from "../types";
import { mimeToExtension } from "../compress";

interface Props {
  file: CompressedFile;
  progress: number;
  onRemove: (id: string) => void;
  onDownload: (file: CompressedFile) => void;
}

export default function FileCard({ file, progress, onRemove, onDownload }: Props) {
  const saving =
    file.compressedSize != null
      ? savingsPercent(file.originalSize, file.compressedSize)
      : 0;

  const savingColor =
    saving >= 50 ? "text-green-400" :
    saving >= 20 ? "text-blue-400" :
    saving > 0   ? "text-yellow-400" : "text-muted";

  const barColor =
    saving >= 50 ? "bg-green-500" :
    saving >= 20 ? "bg-blue-500" :
    saving > 0   ? "bg-yellow-500" : "bg-muted";

  return (
    <div className="group relative rounded-2xl border border-border/50 bg-card/40 overflow-hidden transition-all hover:border-border">

      {/* Remove button */}
      <button
        onClick={() => onRemove(file.id)}
        className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 border border-border/50 text-muted opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-card transition-all"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <div className="h-20 w-20 rounded-xl overflow-hidden border border-border/30 bg-card/50">
            {file.originalUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.compressedUrl ?? file.originalUrl}
                alt={file.originalFile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted/40" />
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="absolute -bottom-1.5 -right-1.5">
            {file.status === "compressing" && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30">
                <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />
              </div>
            )}
            {file.status === "done" && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              </div>
            )}
            {file.status === "error" && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Filename */}
          <p className="text-sm font-medium text-foreground truncate pr-8">
            {file.originalFile.name}
          </p>
          <p className="text-[11px] text-muted mt-0.5">
            {file.originalFile.type.replace("image/", "").toUpperCase()}
            {" → "}
            {file.outputFormat.replace("image/", "").toUpperCase()}
          </p>

          {/* Size stats */}
          <div className="mt-3 space-y-2">
            {file.status === "done" && file.compressedSize != null ? (
              <>
                {/* Before/after bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted">
                      {formatBytes(file.originalSize)}
                      <span className="mx-1.5 text-muted/40">→</span>
                      {formatBytes(file.compressedSize)}
                    </span>
                    <span className={`font-bold ${savingColor}`}>
                      {saving > 0 ? `-${saving}%` : "0%"}
                    </span>
                  </div>
                  {/* Visual bar */}
                  <div className="h-1.5 w-full rounded-full bg-border/30">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{
                        width: `${Math.max(5, 100 - saving)}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : file.status === "compressing" ? (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted">
                  <span>Compressing…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border/30">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : file.status === "error" ? (
              <p className="text-[11px] text-red-400">{file.error}</p>
            ) : (
              <p className="text-[11px] text-muted">
                {formatBytes(file.originalSize)} — pending
              </p>
            )}
          </div>
        </div>

        {/* Download button */}
        {file.status === "done" && file.compressedBlob && (
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => onDownload(file)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/50 text-muted hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 transition-all"
              title={`Download .${mimeToExtension(file.outputFormat)}`}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
