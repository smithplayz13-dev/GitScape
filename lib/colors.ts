// Centralized palette — cinematic data terrain
// Dark navy environment + translucent electric blue tiles + violet/magenta/pink peaks
// Keep this file as the SINGLE source of truth for terrain colors

export const palette = {
  // environment
  bg: "#03070d",
  bgNavy: "#060e1c",
  fog: "#03070d",
  // base tile — floating glass
  tile: "#0e2a4a", // deep translucent blue
  tileEmissive: "#0a4a9a",
  tileEdge: "#1a5fb0",
  // structure gradient: blue → violet → magenta → hot pink
  low: "#1a6cff", // electric blue
  mid: "#6a4bff", // violet
  high: "#c23bff", // magenta
  peak: "#ff3b9a", // hot pink
  peakHot: "#ff5aa8",
  // bloom emissive mirrors structure
  grid: "#0f2b4a",
  gridHolo: "#13365e",
  text: "rgba(255,255,255,0.82)",
  textDim: "rgba(255,255,255,0.35)",
} as const;

// Legacy green palette removed — terrain uses the above.
// For backward compat, map old helpers to new gradient via normalized value
import * as THREE from "three";

const _low = new THREE.Color(palette.low);
const _mid = new THREE.Color(palette.mid);
const _high = new THREE.Color(palette.high);
const _peak = new THREE.Color(palette.peak);

// Smooth blue → violet → pink interpolation
export function getStructureColor(normalized: number): string {
  const n = Math.max(0, Math.min(1, normalized));
  const c = new THREE.Color();
  if (n < 0.33) {
    c.copy(_low).lerp(_mid, n / 0.33);
  } else if (n < 0.66) {
    c.copy(_mid).lerp(_high, (n - 0.33) / 0.33);
  } else {
    c.copy(_high).lerp(_peak, (n - 0.66) / 0.34);
  }
  return `#${c.getHexString()}`;
}

export function getStructureEmissive(normalized: number): string {
  // emissive is slightly more saturated
  return getStructureColor(normalized);
}

export function getTileColor(): string {
  return palette.tile;
}

// Level helpers kept for legacy callers — now map to normalized quartiles
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getColorForLevel(level: number, _hovered?: boolean): string {
  if (level === 0) return palette.tile;
  if (level === 1) return palette.low;
  if (level === 2) return palette.mid;
  if (level === 3) return palette.high;
  return palette.peak;
}
export function getEmissiveForLevel(level: number): string {
  if (level === 0) return "#000000";
  return getColorForLevel(level);
}

export function getLevelForCount(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  if (count >= maxCount * 0.75) return 4;
  if (count >= maxCount * 0.5) return 3;
  if (count >= maxCount * 0.25) return 2;
  return 1;
}

// Legacy alias for old terrain file
export function getTerrainColor(normalized: number): string {
  return getStructureColor(normalized);
}

// Robust percentile / log normalization — prevents one huge day from flattening terrain
export function getNormalizedHeight(count: number, allCounts: number[]): number {
  if (count === 0) return 0;
  const sorted = [...allCounts].filter((c) => c > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  // 92nd percentile as soft cap
  const p92 = sorted[Math.floor(sorted.length * 0.92)] ?? sorted[sorted.length - 1];
  const cap = Math.max(p92 * 1.35, Math.max(...allCounts) * 0.65);
  const capped = Math.min(count, cap);
  // log scaling for perceptual height
  const log = Math.log1p(capped) / Math.log1p(cap);
  // slight gamma for better mid-range visibility
  return Math.pow(log, 0.88);
}
