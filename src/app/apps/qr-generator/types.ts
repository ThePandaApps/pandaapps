import type {
  DotType,
  CornerSquareType,
  CornerDotType,
  ErrorCorrectionLevel,
} from "qr-code-styling";

/* ── Data input type ── */
export type QrDataType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "phone"
  | "sms";

export interface QrDataTypeOption {
  id: QrDataType;
  label: string;
  icon: string;
  placeholder: string;
}

export const QR_DATA_TYPES: QrDataTypeOption[] = [
  { id: "url", label: "URL", icon: "🔗", placeholder: "https://example.com" },
  { id: "text", label: "Text", icon: "📝", placeholder: "Enter any text…" },
  { id: "wifi", label: "WiFi", icon: "📶", placeholder: "" },
  { id: "vcard", label: "Contact", icon: "👤", placeholder: "" },
  { id: "email", label: "Email", icon: "✉️", placeholder: "user@example.com" },
  { id: "phone", label: "Phone", icon: "📞", placeholder: "+1 234 567 8900" },
  { id: "sms", label: "SMS", icon: "💬", placeholder: "+1 234 567 8900" },
];

/* ── WiFi encryption types ── */
export type WifiEncryption = "WPA" | "WEP" | "nopass";

export interface WifiData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

/* ── vCard data ── */
export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  url: string;
}

/* ── Email data ── */
export interface EmailData {
  address: string;
  subject: string;
  body: string;
}

/* ── SMS data ── */
export interface SmsData {
  phone: string;
  message: string;
}

/* ── Dot styles ── */
export interface StyleOption<T> {
  value: T;
  label: string;
}

export const DOT_STYLES: StyleOption<DotType>[] = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
];

export const CORNER_SQUARE_STYLES: StyleOption<CornerSquareType>[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "extra-rounded", label: "Rounded" },
];

export const CORNER_DOT_STYLES: StyleOption<CornerDotType>[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
];

export const ERROR_CORRECTION_LEVELS: StyleOption<ErrorCorrectionLevel>[] = [
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" },
];

/* ── Export formats ── */
export type ExportFormat = "png" | "svg" | "jpeg" | "webp";

export const EXPORT_FORMATS: StyleOption<ExportFormat>[] = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
];

/* ── Preset color themes ── */
export interface ColorPreset {
  name: string;
  fg: string;
  bg: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Classic", fg: "#000000", bg: "#ffffff" },
  { name: "Inverted", fg: "#ffffff", bg: "#000000" },
  { name: "Ocean", fg: "#0369a1", bg: "#e0f2fe" },
  { name: "Forest", fg: "#166534", bg: "#dcfce7" },
  { name: "Sunset", fg: "#c2410c", bg: "#fff7ed" },
  { name: "Purple", fg: "#7e22ce", bg: "#faf5ff" },
  { name: "Rose", fg: "#be123c", bg: "#fff1f2" },
  { name: "Amber", fg: "#b45309", bg: "#fffbeb" },
  { name: "Slate", fg: "#334155", bg: "#f1f5f9" },
  { name: "Midnight", fg: "#6366f1", bg: "#0f172a" },
];

/* ── QR size presets ── */
export const SIZE_PRESETS = [200, 256, 300, 400, 512, 600, 800, 1024] as const;

/* ── Full QR config state ── */
export interface QrConfig {
  dataType: QrDataType;
  // Simple data
  simpleData: string;
  // Structured data
  wifiData: WifiData;
  vcardData: VCardData;
  emailData: EmailData;
  smsData: SmsData;
  // Style
  size: number;
  dotStyle: DotType;
  cornerSquareStyle: CornerSquareType;
  cornerDotStyle: CornerDotType;
  fgColor: string;
  bgColor: string;
  errorCorrection: ErrorCorrectionLevel;
  // Logo
  logoFile: string | null; // data URL
  logoSize: number; // 0.2 – 0.4
  logoMargin: number;
  // Export
  exportFormat: ExportFormat;
}

export const DEFAULT_CONFIG: QrConfig = {
  dataType: "url",
  simpleData: "https://pandaapps.com",
  wifiData: { ssid: "", password: "", encryption: "WPA", hidden: false },
  vcardData: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    url: "",
  },
  emailData: { address: "", subject: "", body: "" },
  smsData: { phone: "", message: "" },
  size: 300,
  dotStyle: "rounded",
  cornerSquareStyle: "extra-rounded",
  cornerDotStyle: "dot",
  fgColor: "#000000",
  bgColor: "#ffffff",
  errorCorrection: "M",
  logoFile: null,
  logoSize: 0.3,
  logoMargin: 5,
  exportFormat: "png",
};
