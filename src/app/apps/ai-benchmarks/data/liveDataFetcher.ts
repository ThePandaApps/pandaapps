// ─────────────────────────────────────────────────────────────────────────────
// Live Data Fetcher — server-side only
//
// Attempts to pull fresh Arena ELO ratings from known API endpoints and merge
// them with the curated static data.  Falls back silently to static data on
// any failure.  Designed for ISR / Next.js server-component usage.
// ─────────────────────────────────────────────────────────────────────────────

import { MODELS, type BenchmarkModel } from "./frontierData";

/* Arena API endpoints (best-effort — may change without notice) */
const ARENA_ENDPOINTS = [
  "https://lmarena.ai/api/v1/latest/elo_overall",
  "https://storage.googleapis.com/arena_external_data/public/clean/latest/overall_elo.json",
];

/* Maps common Arena model keys → our dataset IDs */
const ARENA_ID_MAP: Record<string, string> = {
  "claude-opus-4-6": "claude-opus-4-6",
  "claude-sonnet-4-6": "claude-sonnet-4-6",
  "claude-opus-4-5": "claude-opus-4-5",
  "claude-sonnet-4-5": "claude-sonnet-4-5",
  "gemini-3.1-pro-preview": "gemini-3-1-pro",
  "gemini-3-pro": "gemini-3-pro",
  "gemini-3-flash": "gemini-3-flash",
  "gpt-5.2": "gpt-5-2",
  "gpt-5.1": "gpt-5-1",
  "o3": "o3",
  "grok-4.1": "grok-4-1",
  "glm-5": "glm-5",
  "qwen3.5-397b-a17b": "qwen-3-5-397b",
  "qwen3-235b-a22b": "qwen-3-235b",
  "kimi-k2.5": "kimi-k2-5",
  "deepseek-v3.2": "deepseek-v3-2",
  "deepseek-r1-0528": "deepseek-r1-0528",
  "minimax-m2.5": "minimax-m2-5",
  "mistral-large-3": "mistral-large-3",
  "llama-4-maverick": "llama-4-maverick",
};

/**
 * Fetches fresh data from external APIs and merges with static baseline.
 * Safe for ISR — always returns valid data (static fallback on failure).
 */
export async function fetchFreshModels(): Promise<BenchmarkModel[]> {
  try {
    const eloMap = await fetchArenaElo();
    if (eloMap && Object.keys(eloMap).length >= 3) {
      console.log(`[live-fetch] Merged ${Object.keys(eloMap).length} fresh Arena ELO scores`);
      return MODELS.map(m => ({
        ...m,
        arenaElo: eloMap[m.id] ?? m.arenaElo,
      }));
    }
  } catch (err) {
    console.warn("[live-fetch] Failed, using static data:", err);
  }
  return MODELS;
}

async function fetchArenaElo(): Promise<Record<string, number> | null> {
  for (const url of ARENA_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const map: Record<string, number> = {};

      // Array format: [{ model: "name", elo: 1500 }, ...]
      if (Array.isArray(data)) {
        for (const item of data) {
          const name = String(item.model || item.name || item.key || "").toLowerCase().trim();
          const elo = Number(item.elo || item.rating || item.score);
          if (!name || !isFinite(elo) || elo < 800) continue;
          const id = ARENA_ID_MAP[name];
          if (id) map[id] = Math.round(elo);
        }
      }
      // Object format: { "model_name": 1500, ... }
      else if (typeof data === "object" && data !== null) {
        for (const [name, val] of Object.entries(data)) {
          const elo = Number(val);
          if (!isFinite(elo) || elo < 800) continue;
          const id = ARENA_ID_MAP[name.toLowerCase().trim()];
          if (id) map[id] = Math.round(elo);
        }
      }

      if (Object.keys(map).length >= 3) return map;
    } catch {
      continue;
    }
  }
  return null;
}
