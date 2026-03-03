"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, ImageIcon } from "lucide-react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function DropZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (raw: FileList | null) => {
      if (!raw) return;
      const valid = Array.from(raw).filter((f) => ACCEPTED.includes(f.type));
      if (valid.length) onFiles(valid);
    },
    [onFiles]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500/50 hover:bg-blue-500/5"}
        ${dragging
          ? "border-blue-400 bg-blue-500/10 scale-[1.01]"
          : "border-border/50 bg-card/20"
        }
        py-16 px-8`}
    >
      {/* Animated icon */}
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-2xl border border-border/40 bg-card/50 transition-all
          ${dragging ? "border-blue-400/50 bg-blue-500/10 scale-110" : ""}
        `}
      >
        {dragging ? (
          <ImageIcon className="h-9 w-9 text-blue-400" />
        ) : (
          <Upload className="h-9 w-9 text-muted" />
        )}
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-foreground">
          {dragging ? "Drop images here" : "Drop images or click to upload"}
        </p>
        <p className="text-sm text-muted mt-1">
          Supports JPEG, PNG, WebP, AVIF, GIF — batch upload supported
        </p>
      </div>

      {/* Format badges */}
      <div className="flex gap-2">
        {["JPEG", "PNG", "WebP", "AVIF", "GIF"].map((fmt) => (
          <span
            key={fmt}
            className="rounded-lg border border-border/40 bg-card/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted"
          >
            {fmt}
          </span>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  );
}
