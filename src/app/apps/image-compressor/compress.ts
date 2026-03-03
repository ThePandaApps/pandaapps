import imageCompression from "browser-image-compression";
import type { CompressionSettings, OutputFormat } from "./types";

/**
 * Resolves the actual MIME type to use for output.
 */
function resolveOutputMime(
  originalFile: File,
  outputFormat: OutputFormat
): string {
  if (outputFormat === "original") return originalFile.type || "image/jpeg";
  const map: Record<string, string> = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
  };
  return map[outputFormat] ?? originalFile.type;
}

/**
 * Resolves the file extension from a MIME type.
 */
export function mimeToExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png":  "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif":  "gif",
  };
  return map[mime] ?? "jpg";
}

/**
 * Core compression function.
 * Uses browser-image-compression with smart per-mode options,
 * then re-encodes through Canvas for format conversion and fine quality control.
 */
export async function compressImage(
  file: File,
  settings: CompressionSettings,
  onProgress?: (p: number) => void
): Promise<{ blob: Blob; mime: string }> {
  const targetMime = resolveOutputMime(file, settings.outputFormat);

  // ── 1. Determine compression options per mode ─────────────────────
  let initialQuality: number;
  let maxSizeMB: number;

  switch (settings.mode) {
    case "lossless":
      initialQuality = 1.0;
      maxSizeMB = 999; // no size constraint
      break;
    case "aggressive":
      initialQuality = Math.max(0.3, settings.quality / 100 - 0.2);
      maxSizeMB = 0.5;
      break;
    case "balanced":
    default:
      initialQuality = settings.quality / 100;
      maxSizeMB = 5;
      break;
  }

  // ── 2. First pass: resize + initial compression ───────────────────
  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight:
      settings.maxWidthOrHeight > 0 ? settings.maxWidthOrHeight : 16384,
    useWebWorker: true,
    initialQuality,
    fileType: targetMime,
    exifOrientation: settings.preserveExif ? undefined : -1,
    onProgress: (p: number) => onProgress?.(Math.round(p * 0.7)),
    preserveExif: settings.preserveExif,
    alwaysKeepResolution: settings.mode === "lossless",
  };

  let compressed: File;
  try {
    compressed = await imageCompression(file, compressionOptions);
  } catch {
    // Fallback: try without webworker (some browsers block it)
    compressed = await imageCompression(file, {
      ...compressionOptions,
      useWebWorker: false,
    });
  }

  onProgress?.(75);

  // ── 3. Second pass: precise Canvas re-encode for quality accuracy ──
  // This gives us full control over the final quality and format,
  // especially important for WebP/AVIF which browser-image-compression
  // may not handle perfectly on all browsers.
  try {
    const bitmap = await createImageBitmap(compressed);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d")!;

    // For transparent formats (PNG/WebP/AVIF), keep transparency
    if (
      targetMime === "image/png" ||
      targetMime === "image/webp" ||
      targetMime === "image/avif"
    ) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      // JPEG doesn't support transparency — fill with white
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const quality =
      settings.mode === "lossless"
        ? 1.0
        : settings.mode === "aggressive"
        ? Math.max(0.3, settings.quality / 100 - 0.15)
        : settings.quality / 100;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas toBlob returned null"));
        },
        targetMime,
        quality
      );
    });

    onProgress?.(100);

    // Use whichever is smaller — the canvas re-encode or first pass
    const finalBlob =
      blob.size < compressed.size ? blob : new Blob([compressed], { type: targetMime });

    return { blob: finalBlob, mime: targetMime };
  } catch {
    // Canvas approach failed (e.g. AVIF not supported) — use first pass result
    onProgress?.(100);
    return {
      blob: new Blob([compressed], { type: compressed.type || targetMime }),
      mime: compressed.type || targetMime,
    };
  }
}
