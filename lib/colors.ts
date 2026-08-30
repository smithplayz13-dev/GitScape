// Centralized color configuration — GitHub-inspired intensity palette
// 0 = empty, 1-4 = increasing intensity

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
