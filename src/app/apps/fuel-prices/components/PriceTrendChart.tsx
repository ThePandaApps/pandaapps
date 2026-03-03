"use client";

import { useState, useCallback } from "react";
import { NATIONAL_TREND, type TrendPoint } from "../data/fuelData";

const PAD = { left: 54, right: 20, top: 20, bottom: 50 };
const W = 600;
const H = 260;
const PW = W - PAD.left - PAD.right;  // plot width
const PH = H - PAD.top - PAD.bottom;  // plot height

const GRID_LINES = 5;

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

export default function PriceTrendChart() {
  const data = NATIONAL_TREND;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const petrolVals = data.map((d) => d.petrol);
  const dieselVals = data.map((d) => d.diesel);
  const allVals = [...petrolVals, ...dieselVals];
  const dataMin = Math.floor(Math.min(...allVals)) - 1;
  const dataMax = Math.ceil(Math.max(...allVals)) + 1;

  const xStep = PW / (data.length - 1);

  function xPos(i: number) {
    return PAD.left + i * xStep;
  }

  function yPos(val: number) {
    const t = (val - dataMin) / (dataMax - dataMin);
    return PAD.top + PH - t * PH;
  }

  const petrolPoints = data.map((d, i) => `${xPos(i)},${yPos(d.petrol)}`).join(" ");
  const dieselPoints = data.map((d, i) => `${xPos(i)},${yPos(d.diesel)}`).join(" ");

  // Area paths (close back along baseline)
  function areaPath(vals: number[]) {
    const pts = vals.map((v, i) => `${xPos(i)},${yPos(v)}`).join(" L ");
    const base = yPos(dataMin);
    return `M ${xPos(0)},${base} L ${pts} L ${xPos(vals.length - 1)},${base} Z`;
  }

  const gridValues: number[] = [];
  for (let i = 0; i <= GRID_LINES; i++) {
    gridValues.push(lerp(dataMin, dataMax, i / GRID_LINES));
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      // Scale from rendered size to viewBox coordinates
      const scaleX = W / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      // Clamp to plot area
      const relX = mouseX - PAD.left;
      const idx = Math.round(relX / xStep);
      setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
    },
    [xStep, data.length]
  );

  const handleMouseLeave = useCallback(() => setHoverIdx(null), []);

  const hovered: TrendPoint | null = hoverIdx !== null ? data[hoverIdx] : null;

  // Tooltip position
  let ttX = hoverIdx !== null ? xPos(hoverIdx) : 0;
  let ttAlign: "left" | "right" = "left";
  if (hoverIdx !== null && ttX > W / 2) ttAlign = "right";

  const TOOLTIP_W = 128;
  const ttXFinal =
    ttAlign === "left"
      ? Math.min(ttX + 10, W - TOOLTIP_W - 4)
      : Math.max(ttX - TOOLTIP_W - 10, 4);

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">National Avg. Price Trend</h3>
          <p className="text-xs text-muted mt-0.5">Sep 2024 – Mar 2026 · ₹/litre</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 h-0.5 rounded bg-orange-500" />
            Petrol
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-6 h-0.5 rounded bg-sky-500" />
            Diesel
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="overflow-visible cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Petrol area gradient */}
          <linearGradient id="gradPetrol" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(249,115,22)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="rgb(249,115,22)" stopOpacity="0" />
          </linearGradient>
          {/* Diesel area gradient */}
          <linearGradient id="gradDiesel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(14,165,233)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="rgb(14,165,233)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y-axis labels */}
        {gridValues.map((v, i) => {
          const y = yPos(v);
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="rgba(128,128,128,0.12)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="9"
                fill="rgba(128,128,128,0.7)"
                fontFamily="monospace"
              >
                ₹{v.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels — every other month to avoid clutter */}
        {data.map((d, i) => {
          if (i % 2 !== 0) return null;
          return (
            <text
              key={i}
              x={xPos(i)}
              y={H - PAD.bottom + 18}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(128,128,128,0.7)"
              fontFamily="system-ui, sans-serif"
            >
              {d.month}
            </text>
          );
        })}

        {/* Area fills */}
        <path d={areaPath(petrolVals)} fill="url(#gradPetrol)" />
        <path d={areaPath(dieselVals)} fill="url(#gradDiesel)" />

        {/* Lines */}
        <polyline
          points={dieselPoints}
          fill="none"
          stroke="rgb(14,165,233)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={petrolPoints}
          fill="none"
          stroke="rgb(249,115,22)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Hover crosshair */}
        {hoverIdx !== null && (
          <>
            <line
              x1={xPos(hoverIdx)}
              y1={PAD.top}
              x2={xPos(hoverIdx)}
              y2={PAD.top + PH}
              stroke="rgba(128,128,128,0.35)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            {/* Petrol dot */}
            <circle
              cx={xPos(hoverIdx)}
              cy={yPos(data[hoverIdx].petrol)}
              r={4}
              fill="rgb(249,115,22)"
              stroke="var(--color-card, #1a1a1a)"
              strokeWidth="2"
            />
            {/* Diesel dot */}
            <circle
              cx={xPos(hoverIdx)}
              cy={yPos(data[hoverIdx].diesel)}
              r={4}
              fill="rgb(14,165,233)"
              stroke="var(--color-card, #1a1a1a)"
              strokeWidth="2"
            />

            {/* Tooltip box */}
            <g>
              <rect
                x={ttXFinal}
                y={PAD.top + 4}
                width={TOOLTIP_W}
                height={62}
                rx={8}
                ry={8}
                fill="rgba(20,20,20,0.92)"
                stroke="rgba(128,128,128,0.25)"
                strokeWidth="1"
              />
              <text
                x={ttXFinal + 10}
                y={PAD.top + 20}
                fontSize="9.5"
                fontWeight="600"
                fill="rgba(255,255,255,0.6)"
                fontFamily="system-ui, sans-serif"
              >
                {hovered!.month}
              </text>
              {/* Petrol row */}
              <circle cx={ttXFinal + 13} cy={PAD.top + 34} r={3.5} fill="rgb(249,115,22)" />
              <text
                x={ttXFinal + 22}
                y={PAD.top + 38}
                fontSize="10"
                fill="rgba(255,255,255,0.85)"
                fontFamily="monospace"
              >
                Petrol  ₹{hovered!.petrol.toFixed(2)}
              </text>
              {/* Diesel row */}
              <circle cx={ttXFinal + 13} cy={PAD.top + 52} r={3.5} fill="rgb(14,165,233)" />
              <text
                x={ttXFinal + 22}
                y={PAD.top + 56}
                fontSize="10"
                fill="rgba(255,255,255,0.85)"
                fontFamily="monospace"
              >
                Diesel   ₹{hovered!.diesel.toFixed(2)}
              </text>
            </g>
          </>
        )}

        {/* Axis border */}
        <line
          x1={PAD.left}
          y1={PAD.top + PH}
          x2={W - PAD.right}
          y2={PAD.top + PH}
          stroke="rgba(128,128,128,0.2)"
          strokeWidth="1"
        />
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + PH}
          stroke="rgba(128,128,128,0.2)"
          strokeWidth="1"
        />
      </svg>

      <p className="text-[10px] text-muted/60 text-center">
        Approximate national average · Hover to inspect a month · Prices change with crude oil revisions
      </p>
    </div>
  );
}
