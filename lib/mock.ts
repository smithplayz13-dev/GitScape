import type { ContributionCalendar, ContributionDay } from "@/types/github";
import { getLevelForCount } from "./colors";

// Deterministic seeded random for demo consistency
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateMockCalendar(year: number, seed = 42): ContributionCalendar {
  const rand = seededRandom(seed + year);
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  // pad start to Sunday
  const firstSunday = new Date(start);
  firstSunday.setDate(start.getDate() - start.getDay());

  const days: ContributionDay[] = [];

  // generate counts first to compute max
  const tempCounts: number[] = [];
  const totalDays = Math.ceil(
    (end.getTime() - firstSunday.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(firstSunday);
    d.setDate(firstSunday.getDate() + i);
    if (d < start || d > end) {
      tempCounts.push(0);
      continue;
    }
    // weekend dip, weekday boost, seasonal variation
    const r = rand();
    let count = 0;
    if (r > 0.35) {
      // 65% chance of contributing
      const base = Math.floor(rand() * 8) + 1;
      // occasionally spike
      count = rand() > 0.92 ? base + Math.floor(rand() * 12) : base;
      // weekend lower
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) count = Math.floor(count * 0.6);
    }
    tempCounts.push(count);
  }

  const maxCount = Math.max(...tempCounts, 1);

  // Build ContributionDay objects
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(firstSunday);
    d.setDate(firstSunday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const count = tempCounts[i];
    // only include days within the year for days array, but weeks need padded cells
    // For weeks structure, we keep all; for days flattened, only within year
    const level = getLevelForCount(count, maxCount);
    days.push({ date: iso, count, level });
  }

  // Build weeks (7-day chunks)
  const weeks: { days: ContributionDay[] }[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push({ days: days.slice(i, i + 7) });
  }

  // For calendar days (only within year)
  const withinYearDays = days.filter((d) => {
    const dt = new Date(d.date + "T00:00:00");
    return dt.getFullYear() === year;
  });

  const totalContributions = withinYearDays.reduce((s, d) => s + d.count, 0);

  return {
    totalContributions,
    weeks,
    days: withinYearDays,
  };
}

export function generateMockUser() {
  return {
    login: "demo",
    name: "Demo User",
    avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
    bio: "Demo account — explore the 3D contribution landscape.",
  };
}
