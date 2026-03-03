"use client";

import {
  DOT_STYLES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  ERROR_CORRECTION_LEVELS,
  COLOR_PRESETS,
  SIZE_PRESETS,
} from "../types";
import type { QrConfig } from "../types";
import type {
  DotType,
  CornerSquareType,
  CornerDotType,
  ErrorCorrectionLevel,
} from "qr-code-styling";
import { Upload, X, RotateCcw } from "lucide-react";
import { DEFAULT_CONFIG } from "../types";
import { useRef } from "react";

interface Props {
  config: QrConfig;
  onChange: (c: Partial<QrConfig>) => void;
}

export default function StylePanel({ config, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ logoFile: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    onChange({ logoFile: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* ── Color Presets ── */}
      <Section title="Color Preset">
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isActive =
              config.fgColor === preset.fg && config.bgColor === preset.bg;
            return (
              <button
                key={preset.name}
                onClick={() =>
                  onChange({ fgColor: preset.fg, bgColor: preset.bg })
                }
                className={`group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                  isActive
                    ? "border-accent/50 bg-accent/5"
                    : "border-border/40 hover:border-border"
                }`}
                title={preset.name}
              >
                <div className="flex h-6 w-full rounded-lg overflow-hidden border border-border/30">
                  <div
                    className="w-1/2"
                    style={{ backgroundColor: preset.bg }}
                  />
                  <div
                    className="w-1/2"
                    style={{ backgroundColor: preset.fg }}
                  />
                </div>
                <span className="text-[10px] text-muted">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Custom Colors ── */}
      <Section title="Custom Colors">
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="Foreground"
            value={config.fgColor}
            onChange={(v) => onChange({ fgColor: v })}
          />
          <ColorPicker
            label="Background"
            value={config.bgColor}
            onChange={(v) => onChange({ bgColor: v })}
          />
        </div>
      </Section>

      {/* ── Dot Style ── */}
      <Section title="Dot Style">
        <div className="grid grid-cols-3 gap-2">
          {DOT_STYLES.map((s) => (
            <StyleButton
              key={s.value}
              label={s.label}
              isActive={config.dotStyle === s.value}
              onClick={() => onChange({ dotStyle: s.value as DotType })}
            />
          ))}
        </div>
      </Section>

      {/* ── Corner Styles ── */}
      <div className="grid grid-cols-2 gap-4">
        <Section title="Corner Square">
          <div className="space-y-1.5">
            {CORNER_SQUARE_STYLES.map((s) => (
              <StyleButton
                key={s.value}
                label={s.label}
                isActive={config.cornerSquareStyle === s.value}
                onClick={() =>
                  onChange({
                    cornerSquareStyle: s.value as CornerSquareType,
                  })
                }
              />
            ))}
          </div>
        </Section>
        <Section title="Corner Dot">
          <div className="space-y-1.5">
            {CORNER_DOT_STYLES.map((s) => (
              <StyleButton
                key={s.value}
                label={s.label}
                isActive={config.cornerDotStyle === s.value}
                onClick={() =>
                  onChange({
                    cornerDotStyle: s.value as CornerDotType,
                  })
                }
              />
            ))}
          </div>
        </Section>
      </div>

      {/* ── Logo Upload ── */}
      <Section title="Center Logo">
        {config.logoFile ? (
          <div className="space-y-3">
            <div className="relative inline-block rounded-xl border border-border/50 p-2 bg-card/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.logoFile}
                alt="Logo preview"
                className="h-16 w-16 object-contain rounded-lg"
              />
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/90 text-white hover:bg-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">
                Logo Size: {Math.round(config.logoSize * 100)}%
              </label>
              <input
                type="range"
                min={0.15}
                max={0.4}
                step={0.01}
                value={config.logoSize}
                onChange={(e) =>
                  onChange({ logoSize: parseFloat(e.target.value) })
                }
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">
                Logo Margin: {config.logoMargin}px
              </label>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={config.logoMargin}
                onChange={(e) =>
                  onChange({ logoMargin: parseInt(e.target.value) })
                }
                className="w-full accent-accent"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-card/20 py-6 text-sm text-muted hover:border-accent/30 hover:bg-accent/5 hover:text-accent transition-all"
          >
            <Upload className="h-4 w-4" />
            Upload Logo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </Section>

      {/* ── Error Correction ── */}
      <Section title="Error Correction">
        <div className="grid grid-cols-4 gap-2">
          {ERROR_CORRECTION_LEVELS.map((lvl) => (
            <StyleButton
              key={lvl.value}
              label={lvl.label}
              isActive={config.errorCorrection === lvl.value}
              onClick={() =>
                onChange({
                  errorCorrection: lvl.value as ErrorCorrectionLevel,
                })
              }
            />
          ))}
        </div>
      </Section>

      {/* ── Size ── */}
      <Section title={`Size: ${config.size}px`}>
        <div className="flex flex-wrap gap-2">
          {SIZE_PRESETS.map((s) => (
            <StyleButton
              key={s}
              label={`${s}`}
              isActive={config.size === s}
              onClick={() => onChange({ size: s })}
            />
          ))}
        </div>
      </Section>

      {/* ── Reset ── */}
      <button
        onClick={() =>
          onChange({
            ...DEFAULT_CONFIG,
            dataType: config.dataType,
            simpleData: config.simpleData,
            wifiData: config.wifiData,
            vcardData: config.vcardData,
            emailData: config.emailData,
            smsData: config.smsData,
          })
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/30 py-3 text-xs font-medium text-muted hover:text-foreground hover:bg-card/50 transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset Styles
      </button>
    </div>
  );
}

/* ── Helper components ── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2.5">
        {title}
      </label>
      {children}
    </div>
  );
}

function StyleButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
        isActive
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border/40 bg-card/20 text-muted hover:bg-card/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/30 px-3 py-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 rounded-lg border-none cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs font-mono text-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}
