import {
  type RGB, type PaletteColor, type HarmonyType,
  makeColor, hslToRgb, hexToColor, rgbToHsl,
} from "./types";

/* ═══════════════════════════════════════════════════════════════════
   COLOR EXTRACTION — Median Cut algorithm
   ═════════════════════════════════════════════════════════════════ */

interface Bucket { pixels: RGB[] }

function bucketRange(pixels: RGB[]): { axis: "r" | "g" | "b"; range: number } {
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;
  for (const { r, g, b } of pixels) {
    if (r < rMin) rMin = r; if (r > rMax) rMax = r;
    if (g < gMin) gMin = g; if (g > gMax) gMax = g;
    if (b < bMin) bMin = b; if (b > bMax) bMax = b;
  }
  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;
  if (rRange >= gRange && rRange >= bRange) return { axis: "r", range: rRange };
  if (gRange >= bRange) return { axis: "g", range: gRange };
  return { axis: "b", range: bRange };
}

function splitBucket(bucket: Bucket): [Bucket, Bucket] {
  const { axis } = bucketRange(bucket.pixels);
  const sorted = [...bucket.pixels].sort((a, b) => a[axis] - b[axis]);
  const mid = Math.floor(sorted.length / 2);
  return [{ pixels: sorted.slice(0, mid) }, { pixels: sorted.slice(mid) }];
}

function averageBucket(pixels: RGB[]): RGB {
  let r = 0, g = 0, b = 0;
  for (const p of pixels) { r += p.r; g += p.g; b += p.b; }
  return {
    r: Math.round(r / pixels.length),
    g: Math.round(g / pixels.length),
    b: Math.round(b / pixels.length),
  };
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
  );
}

function deduplicateColors(colors: RGB[], threshold = 30): RGB[] {
  const result: RGB[] = [];
  for (const c of colors) {
    if (!result.some((r) => colorDistance(c, r) < threshold)) {
      result.push(c);
    }
  }
  return result;
}

/**
 * Extract N dominant colors from an image using median-cut quantisation.
 * Samples every sampleRate-th pixel for performance.
 */
export function extractColorsFromImageData(
  data: Uint8ClampedArray,
  count = 8,
  sampleRate = 4
): PaletteColor[] {
  // Collect sampled pixels (skip fully transparent)
  const pixels: RGB[] = [];
  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    if (data[i + 3] < 128) continue; // skip transparent
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
  }
  if (pixels.length === 0) return [];

  // Median-cut until we have `count` buckets
  let buckets: Bucket[] = [{ pixels }];
  while (buckets.length < count) {
    // Split the bucket with the widest range
    let maxRange = -1;
    let maxIdx = 0;
    buckets.forEach((bk, i) => {
      const { range } = bucketRange(bk.pixels);
      if (range > maxRange && bk.pixels.length > 1) {
        maxRange = range;
        maxIdx = i;
      }
    });
    if (maxRange <= 0) break;
    const [a, b] = splitBucket(buckets[maxIdx]);
    buckets.splice(maxIdx, 1, a, b);
  }

  // Average each bucket → candidate color
  const candidates = buckets
    .filter((bk) => bk.pixels.length > 0)
    .map((bk) => averageBucket(bk.pixels));

  // Sort by bucket size desc (most common first)
  const sorted = buckets
    .filter((bk) => bk.pixels.length > 0)
    .sort((a, b) => b.pixels.length - a.pixels.length)
    .map((bk) => averageBucket(bk.pixels));

  const unique = deduplicateColors(sorted, 28);
  return unique.slice(0, count).map(({ r, g, b }) => makeColor(r, g, b));
}

/* ═══════════════════════════════════════════════════════════════════
   COLOR HARMONY GENERATION
   ═════════════════════════════════════════════════════════════════ */

function shiftHue(hsl: { h: number; s: number; l: number }, deg: number) {
  return { ...hsl, h: (hsl.h + deg + 360) % 360 };
}

function fromHsl(h: number, s: number, l: number): PaletteColor {
  const rgb = hslToRgb({ h, s, l });
  return makeColor(rgb.r, rgb.g, rgb.b);
}

export function generateHarmony(
  baseHex: string,
  type: HarmonyType
): PaletteColor[] {
  const base = hexToColor(baseHex);
  const { h, s, l } = base.hsl;

  switch (type) {
    case "complementary":
      return [
        base,
        fromHsl((h + 180) % 360, s, l),
      ];

    case "analogous":
      return [
        fromHsl((h - 60 + 360) % 360, s, l),
        fromHsl((h - 30 + 360) % 360, s, l),
        base,
        fromHsl((h + 30) % 360, s, l),
        fromHsl((h + 60) % 360, s, l),
      ];

    case "triadic":
      return [
        base,
        fromHsl((h + 120) % 360, s, l),
        fromHsl((h + 240) % 360, s, l),
      ];

    case "split-complementary":
      return [
        base,
        fromHsl((h + 150) % 360, s, l),
        fromHsl((h + 210) % 360, s, l),
      ];

    case "tetradic":
      return [
        base,
        fromHsl((h + 90)  % 360, s, l),
        fromHsl((h + 180) % 360, s, l),
        fromHsl((h + 270) % 360, s, l),
      ];

    case "monochromatic": {
      // Same hue, vary lightness in 5 steps, keep saturation
      const steps = [15, 30, l, Math.min(l + 25, 90), Math.min(l + 45, 95)];
      // deduplicate near-identical lightness
      const ls = [...new Set(steps.map((v) => Math.round(v)))].sort((a, b) => a - b);
      return ls.slice(0, 5).map((lv) => fromHsl(h, s, lv));
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   EXPORT BUILDERS
   ═════════════════════════════════════════════════════════════════ */

export function buildCss(colors: PaletteColor[], name = "palette"): string {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const vars = colors
    .map((c, i) => `  --${slug}-${i + 1}: ${c.hex};`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

export function buildScss(colors: PaletteColor[], name = "palette"): string {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return colors
    .map((c, i) => `$${slug}-${i + 1}: ${c.hex};`)
    .join("\n");
}

export function buildTailwind(colors: PaletteColor[], name = "palette"): string {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const inner = colors
    .map((c, i) => `    "${i + 1}00": "${c.hex}",`)
    .join("\n");
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        "${slug}": {
${inner}
        },
      },
    },
  },
};`;
}

export function buildJson(colors: PaletteColor[], name = "palette"): string {
  const obj = {
    name,
    colors: colors.map((c, i) => ({
      index: i + 1,
      hex:   c.hex,
      rgb:   c.rgb,
      hsl:   c.hsl,
    })),
  };
  return JSON.stringify(obj, null, 2);
}

/** Renders a PNG color swatch strip (240×80 px per color) */
export async function buildSwatchPng(
  colors: PaletteColor[],
  name = "palette"
): Promise<string> {
  const W = 240;
  const H = 120;
  const canvas = document.createElement("canvas");
  canvas.width  = W * colors.length;
  canvas.height = H + 28;
  const ctx = canvas.getContext("2d")!;

  colors.forEach((c, i) => {
    // Color block
    ctx.fillStyle = c.hex;
    ctx.fillRect(i * W, 0, W, H);
    // Hex label
    const light = 0.299 * c.rgb.r + 0.587 * c.rgb.g + 0.114 * c.rgb.b > 186;
    ctx.fillStyle = light ? "#111" : "#fff";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(c.hex.toUpperCase(), i * W + W / 2, H - 14);
  });
  // Footer label
  ctx.fillStyle = "#0f0f12";
  ctx.fillRect(0, H, canvas.width, 28);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${name} — PandaApps`, 12, H + 18);

  return canvas.toDataURL("image/png");
}
