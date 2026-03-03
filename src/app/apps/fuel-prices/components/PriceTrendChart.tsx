"use client";

import { useState, useCallback } from "react";
import { NATIONAL_TREND, type TrendPoint } from "../data/fuelData";

const PAD = { left: 54, right: 20, top: 20, bottom: 50 };
const W = 600;
const H = 260;
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top  - PAD.bottom;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

type Range = "1D" | "1W" | "1M" | "6M" | "1Y" | "2Y" | "5Y" | "10Y";
const RANGE_POINTS: Record<Range, number | null> = {
  "1D": null, "1W": null, "1M": 2, "6M": 6, "1Y": 12, "2Y": 24, "5Y": 60, "10Y": 121,
};
const RANGES: Range[] = ["1D","1W","1M","6M","1Y","2Y","5Y","10Y"];

function labelStep(n: number) {
  if (n <= 6)  return 1;
  if (n <= 14) return 2;
  if (n <= 30) return 3;
  if (n <= 60) return 6;
  return 12;
}

function Chart({ data }: { data: TrendPoint[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const allVals = [...data.map(d => d.petrol), ...data.map(d => d.diesel)];
  const dMin = Math.floor(Math.min(...allVals)) - 1;
  const dMax = Math.ceil(Math.max(...allVals))  + 1;
  const xStep = data.length > 1 ? PW / (data.length - 1) : PW;
  const xP = (i: number) => PAD.left + i * xStep;
  const yP = (v: number) => PAD.top + PH - ((v - dMin) / (dMax - dMin)) * PH;
  const ptsLine = (vals: number[]) => vals.map((v, i) => `${xP(i)},${yP(v)}`).join(" ");
  const area = (vals: number[]) =>
    `M ${xP(0)},${yP(dMin)} L ${vals.map((v,i) => `${xP(i)},${yP(v)}`).join(" L ")} L ${xP(vals.length-1)},${yP(dMin)} Z`;
  const gridVals = Array.from({ length: 5 }, (_, i) => lerp(dMin, dMax, i / 4));
  const step = labelStep(data.length);

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) * (W / rect.width) - PAD.left;
    setHoverIdx(Math.max(0, Math.min(data.length - 1, Math.round(relX / xStep))));
  }, [xStep, data.length]);

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const TOOLTIP_W = 148;
  const ttX = hoverIdx !== null ? xP(hoverIdx) : 0;
  const ttXF = Math.max(4, Math.min(ttX > W / 2 ? ttX - TOOLTIP_W - 10 : ttX + 10, W - TOOLTIP_W - 4));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%"
      className="overflow-visible cursor-crosshair select-none"
      onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)}>
      <defs>
        <linearGradient id="fgp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(249,115,22)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="rgb(249,115,22)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fgd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(14,165,233)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="rgb(14,165,233)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={PAD.left} y1={yP(v)} x2={W - PAD.right} y2={yP(v)}
            stroke="rgba(128,128,128,0.12)" strokeWidth="1" />
          <text x={PAD.left - 5} y={yP(v) + 4} textAnchor="end"
            fontSize="9" fill="rgba(128,128,128,0.7)" fontFamily="monospace">
            {`₹${v.toFixed(0)}`}
          </text>
        </g>
      ))}
      {data.map((d, i) => i % step === 0 && (
        <text key={i} x={xP(i)} y={H - PAD.bottom + 18} textAnchor="middle"
          fontSize="9" fill="rgba(128,128,128,0.7)" fontFamily="system-ui, sans-serif">
          {d.month}
        </text>
      ))}
      <path d={area(data.map(d => d.petrol))} fill="url(#fgp)" />
      <path d={area(data.map(d => d.diesel))} fill="url(#fgd)" />
      <polyline points={ptsLine(data.map(d => d.diesel))} fill="none" stroke="rgb(14,165,233)"
        strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={ptsLine(data.map(d => d.petrol))} fill="none" stroke="rgb(249,115,22)"
        strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      {hoverIdx !== null && hovered && (
        <>
          <line x1={xP(hoverIdx)} y1={PAD.top} x2={xP(hoverIdx)} y2={PAD.top + PH}
            stroke="rgba(128,128,128,0.35)" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx={xP(hoverIdx)} cy={yP(hovered.petrol)} r={4}
            fill="rgb(249,115,22)" stroke="rgba(15,15,15,0.9)" strokeWidth="2" />
          <circle cx={xP(hoverIdx)} cy={yP(hovered.diesel)} r={4}
            fill="rgb(14,165,233)" stroke="rgba(15,15,15,0.9)" strokeWidth="2" />
          <rect x={ttXF} y={PAD.top + 4} width={TOOLTIP_W} height={62} rx={8} ry={8}
            fill="rgba(18,18,18,0.94)" stroke="rgba(128,128,128,0.25)" strokeWidth="1" />
          <text x={ttXF + 10} y={PAD.top + 20} fontSize="9.5" fontWeight="600"
            fill="rgba(255,255,255,0.55)" fontFamily="system-ui, sans-serif">
            {hovered.month}
          </text>
          <circle cx={ttXF + 13} cy={PAD.top + 34} r={3.5} fill="rgb(249,115,22)" />
          <text x={ttXF + 22} y={PAD.top + 38} fontSize="10"
            fill="rgba(255,255,255,0.9)" fontFamily="monospace">
            {`Petrol  ₹${hovered.petrol.toFixed(1)}`}
          </text>
          <circle cx={ttXF + 13} cy={PAD.top + 52} r={3.5} fill="rgb(14,165,233)" />
          <text x={ttXF + 22} y={PAD.top + 56} fontSize="10"
            fill="rgba(255,255,255,0.9)" fontFamily="monospace">
            {`Diesel  ₹${hovered.diesel.toFixed(1)}`}
          </text>
        </>
      )}
      <line x1={PAD.left} y1={PAD.top + PH} x2={W - PAD.right} y2={PAD.top + PH}
        stroke="rgba(128,128,128,0.2)" strokeWidth="1" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PH}
        stroke="rgba(128,128,128,0.2)" strokeWidth="1" />
    </svg>
  );
}

export default function PriceTrendChart() {
  const [range, setRange] = useState<Range>("1Y");
  const pts = RANGE_POINTS[range];
  const slice = pts !== null ? NATIONAL_TREND.slice(-pts) : [];
  const first = slice[0];
  const last  = slice[slice.length - 1];
  const pChg = first && last ? ((last.petrol - first.petrol) / first.petrol) * 100 : 0;
  const dChg = first && last ? ((last.diesel - first.diesel) / first.diesel) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm">National Avg. Price Trend</h3>
          <p className="text-xs text-muted mt-0.5">India &middot; &#8377;/litre &middot; Monthly avg</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 rounded bg-orange-500" /> Petrol
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 rounded bg-sky-500" /> Diesel
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {RANGES.map((r) => {
          const disabled = RANGE_POINTS[r] === null;
          const active   = range === r;
          return (
            <button key={r} disabled={disabled} onClick={() => setRange(r)}
              title={disabled ? "Requires live intraday data" : undefined}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all
                ${disabled
                  ? "text-muted/30 cursor-not-allowed"
                  : active
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-white/10"}`}>
              {r}
            </button>
          );
        })}
        {first && last && (
          <span className="ml-auto text-[11px] text-muted">
            <span className={pChg >= 0 ? "text-green-400" : "text-red-400"}>
              P {pChg >= 0 ? "+" : ""}{pChg.toFixed(1)}%
            </span>
            <span className="mx-1.5 text-muted/40">&middot;</span>
            <span className={dChg >= 0 ? "text-green-400" : "text-red-400"}>
              D {dChg >= 0 ? "+" : ""}{dChg.toFixed(1)}%
            </span>
          </span>
        )}
      </div>

      {pts === null ? (
        <div className="h-40 flex items-center justify-center text-sm text-muted/50">
          Intraday / weekly data requires a live market API
        </div>
      ) : (
        <Chart data={slice} />
      )}

      <p className="text-[10px] text-muted/60 text-center">
        Approximate national average &middot; Hover to inspect &middot; Prices revised by OMCs periodically
      </p>
    </div>
  );
}
