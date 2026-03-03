/* ── Core color types ─────────────────────────────────────────────── */
export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }

export interface PaletteColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  name?: string;
}

export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochromatic";

export type ExportFormat = "css" | "scss" | "tailwind" | "json" | "swatch";

export type TabId = "extract" | "harmony" | "presets";

/* ── Preset palettes ──────────────────────────────────────────────── */
export interface PresetPalette {
  name: string;
  tags: string[];
  colors: string[]; // hex strings
}

export const PRESET_PALETTES: PresetPalette[] = [
  {
    name: "Midnight Ocean",
    tags: ["dark", "cool", "professional"],
    colors: ["#0f0c29", "#1a1a5e", "#1e3a8a", "#1d4ed8", "#60a5fa"],
  },
  {
    name: "Sunset Blaze",
    tags: ["warm", "vibrant", "energetic"],
    colors: ["#1a0000", "#7f1d1d", "#dc2626", "#fb923c", "#fde68a"],
  },
  {
    name: "Forest Mist",
    tags: ["nature", "calm", "green"],
    colors: ["#052e16", "#14532d", "#16a34a", "#4ade80", "#d1fae5"],
  },
  {
    name: "Cotton Candy",
    tags: ["pastel", "soft", "feminine"],
    colors: ["#fce7f3", "#fbcfe8", "#f9a8d4", "#ec4899", "#9d174d"],
  },
  {
    name: "Cosmic Grape",
    tags: ["dark", "purple", "bold"],
    colors: ["#0d001a", "#3b0764", "#7c3aed", "#a78bfa", "#ede9fe"],
  },
  {
    name: "Desert Dunes",
    tags: ["warm", "earthy", "neutral"],
    colors: ["#78350f", "#b45309", "#d97706", "#fbbf24", "#fef3c7"],
  },
  {
    name: "Arctic Frost",
    tags: ["cool", "minimal", "clean"],
    colors: ["#ecfeff", "#a5f3fc", "#22d3ee", "#0891b2", "#164e63"],
  },
  {
    name: "Neon Nights",
    tags: ["dark", "neon", "cyberpunk"],
    colors: ["#0a0a0a", "#1a0533", "#7c3aed", "#06b6d4", "#f0abfc"],
  },
  {
    name: "Autumn Leaves",
    tags: ["warm", "nature", "seasonal"],
    colors: ["#431407", "#9a3412", "#ea580c", "#fb923c", "#fed7aa"],
  },
  {
    name: "Monochrome Pro",
    tags: ["minimal", "clean", "neutral"],
    colors: ["#030712", "#111827", "#374151", "#9ca3af", "#f9fafb"],
  },
  {
    name: "Cherry Blossom",
    tags: ["pink", "soft", "japanese"],
    colors: ["#fff1f2", "#fecdd3", "#fb7185", "#e11d48", "#881337"],
  },
  {
    name: "Deep Sea",
    tags: ["dark", "teal", "moody"],
    colors: ["#042f2e", "#134e4a", "#0f766e", "#14b8a6", "#99f6e4"],
  },
];

export const HARMONY_OPTIONS: { value: HarmonyType; label: string; count: number; description: string }[] = [
  { value: "complementary",       label: "Complementary",       count: 2, description: "Two opposite colors — high contrast" },
  { value: "analogous",           label: "Analogous",           count: 5, description: "Colors next to each other — harmonious" },
  { value: "triadic",             label: "Triadic",             count: 3, description: "Three evenly spaced — vibrant & balanced" },
  { value: "split-complementary", label: "Split-Complementary", count: 3, description: "Base + two adjacent to its complement" },
  { value: "tetradic",            label: "Tetradic",            count: 4, description: "Four colors in a rectangle — rich variety" },
  { value: "monochromatic",       label: "Monochromatic",       count: 5, description: "Same hue, varying lightness & saturation" },
];

export const EXPORT_FORMAT_OPTIONS: { value: ExportFormat; label: string; ext: string }[] = [
  { value: "css",      label: "CSS Variables",    ext: "css"  },
  { value: "scss",     label: "SCSS Variables",   ext: "scss" },
  { value: "tailwind", label: "Tailwind Config",  ext: "js"   },
  { value: "json",     label: "JSON",             ext: "json" },
  { value: "swatch",   label: "PNG Swatch",       ext: "png"  },
];

/* ── Conversions ──────────────────────────────────────────────────── */
export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn)      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else                 h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, hn)       * 255),
    b: Math.round(hue2rgb(p, q, hn - 1/3) * 255),
  };
}

export function hexToColor(hex: string): PaletteColor {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return { hex: hex.toLowerCase(), rgb, hsl };
}

export function makeColor(r: number, g: number, b: number): PaletteColor {
  const rgb = { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  return { hex: rgbToHex(rgb), rgb, hsl: rgbToHsl(rgb) };
}

/** Is the color "light" (should use dark text)? */
export function isLight({ r, g, b }: RGB): boolean {
  // Perceived luminance
  return 0.299 * r + 0.587 * g + 0.114 * b > 186;
}
