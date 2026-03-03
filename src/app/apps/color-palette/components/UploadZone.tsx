"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, ImageIcon } from "lucide-react";

interface Props {
  onFile: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onFile, isProcessing }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    onFile(file);
  }, [onFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handle(e.dataTransfer.files[0]);
  }, [handle]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => handle(e.target.files?.[0]);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
        dragging
          ? "border-pink-500/60 bg-pink-500/8 scale-[1.01]"
          : "border-border/40 bg-card/20 hover:border-pink-500/40 hover:bg-card/30"
      } ${isProcessing ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />

      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
        dragging ? "bg-pink-500/20" : "bg-card/60"
      }`}>
        {isProcessing ? (
          <div className="h-6 w-6 rounded-full border-2 border-pink-500/30 border-t-pink-400 animate-spin" />
        ) : (
          <ImageIcon className={`h-6 w-6 ${dragging ? "text-pink-400" : "text-muted"}`} />
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">
          {isProcessing ? "Extracting colors…" : "Drop an image here"}
        </p>
        <p className="text-xs text-muted mt-1">
          {isProcessing ? "Running median-cut algorithm" : "or click to browse — JPEG, PNG, WebP, GIF, AVIF supported"}
        </p>
      </div>

      {!isProcessing && (
        <div className="flex items-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/5 px-4 py-2">
          <Upload className="h-3.5 w-3.5 text-pink-400" />
          <span className="text-xs text-pink-300 font-medium">Select image</span>
        </div>
      )}
    </div>
  );
}
