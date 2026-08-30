"use client";

import type { Stats } from "@/types/github";

export default function StatsPanel({ stats, demo }: { stats: Stats; demo?: boolean }) {
  const items = [
    {
      label: "TOTAL CONTRIBUTIONS",
      value: stats.totalContributions.toLocaleString(),
    },
    {
      label: "CURRENT STREAK",
      value: `${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`,
    },
    {
      label: "LONGEST STREAK",
      value: `${stats.longestStreak} day${stats.longestStreak === 1 ? "" : "s"}`,
    },
    {
      label: "BEST DAY",
      value: stats.mostProductiveDay
        ? `${new Date(stats.mostProductiveDay.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${stats.mostProductiveDay.count}`
        : "—",
    },
    {
      label: "BEST MONTH",
      value: stats.mostProductiveMonth ? stats.mostProductiveMonth.month : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5 backdrop-blur-sm"
        >
          <div className="text-[10px] font-medium tracking-widest text-white/40">{it.label}</div>
          <div className="mt-1.5 text-[15px] font-semibold tracking-tight text-white">{it.value}</div>
        </div>
      ))}
      {demo && (
        <div className="col-span-2 md:col-span-5 mt-1 text-center text-[11px] text-white/30">
          Demo data — sign in with GitHub to see your real contributions
        </div>
      )}
    </div>
  );
}
