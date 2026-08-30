import type { ContributionDay, Stats } from "@/types/github";

export function calculateStats(days: ContributionDay[]): Stats {
  if (days.length === 0) {
    return {
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
      mostProductiveDay: null,
      mostProductiveMonth: null,
    };
  }

  const totalContributions = days.reduce((sum, d) => sum + d.count, 0);

  // Streaks: consecutive days with >0 contributions, sorted by date ascending
  const sorted = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let longest = 0;
  let current = 0;
  let temp = 0;

  for (const d of sorted) {
    if (d.count > 0) temp++;
    else {
      longest = Math.max(longest, temp);
      temp = 0;
    }
  }
  longest = Math.max(longest, temp);

  // current streak: from most recent day backwards
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].count > 0) current++;
    else break;
  }

  let mostProductiveDay: ContributionDay | null = sorted[0];
  for (const d of sorted) {
    if (d.count > (mostProductiveDay?.count ?? -1)) mostProductiveDay = d;
  }

  const monthMap = new Map<string, number>();
  for (const d of sorted) {
    const date = new Date(d.date + "T00:00:00");
    const key = date.toLocaleString("en-US", { month: "long" });
    monthMap.set(key, (monthMap.get(key) ?? 0) + d.count);
  }
  let bestMonth: { month: string; count: number } | null = null;
  for (const [month, count] of monthMap.entries()) {
    if (!bestMonth || count > bestMonth.count) bestMonth = { month, count };
  }

  return {
    totalContributions,
    currentStreak: current,
    longestStreak: longest,
    mostProductiveDay,
    mostProductiveMonth: bestMonth,
  };
}
