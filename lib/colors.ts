// Centralized color configuration — GitHub-inspired intensity palette
// 0 = empty, 1-4 = increasing intensity
// Extended for cinematic city/terrain/galaxy world

export const contributionColors = {
  level0: "#161b22", // nearly invisible / dark — 0 contributions
  level1: "#0e4429",
  level2: "#006d32",
  level3: "#26a641",
  level4: "#39d353", // brightest — high intensity
} as const;

export const contributionColorsHover = {
  level0: "#1c2430",
  level1: "#14532f",
  level2: "#0a7a3a",
  level3: "#2db84a",
  level4: "#4ae05e",
} as const;

// Cinematic emissive palette — used for windows / bloom
export const emissiveColors = {
  level0: "#000000",
  level1: "#0a2e1a",
  level2: "#0f4d28",
  level3: "#1a8a3a",
  level4: "#39d353",
} as const;

export function getColorForLevel(level: number, hovered = false): string {
  const palette = hovered ? contributionColorsHover : contributionColors;
  switch (level) {
    case 0:
      return palette.level0;
    case 1:
      return palette.level1;
    case 2:
      return palette.level2;
    case 3:
      return palette.level3;
    case 4:
      return palette.level4;
    default:
      return palette.level0;
  }
}

export function getEmissiveForLevel(level: number): string {
  switch (level) {
    case 0:
      return emissiveColors.level0;
    case 1:
      return emissiveColors.level1;
    case 2:
      return emissiveColors.level2;
    case 3:
      return emissiveColors.level3;
    case 4:
      return emissiveColors.level4;
    default:
      return emissiveColors.level0;
  }
}

// Derive level from count (mirrors GitHub's quartile logic roughly)
export function getLevelForCount(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  // simple thresholds — tuned for visual variety
  if (count >= maxCount * 0.75) return 4;
  if (count >= maxCount * 0.5) return 3;
  if (count >= maxCount * 0.25) return 2;
  return 1;
}

// Terrain gradient — maps normalized height to color
export function getTerrainColor(normalized: number): string {
  if (normalized <= 0.02) return "#0e1a14";
  if (normalized < 0.2) return "#1a2e1f";
  if (normalized < 0.4) return "#1f3d26";
  if (normalized < 0.65) return "#2a5a32";
  if (normalized < 0.85) return "#2f7a3d";
  return "#39d353";
}
