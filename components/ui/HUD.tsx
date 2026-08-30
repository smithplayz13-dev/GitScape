"use client";

import type { Stats } from "@/types/github";

export default function HUD({ stats, totalContributions, year }: { stats: Stats; totalContributions: number; year: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-widest">
      <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur">
        <span className="font-semibold text-white">{totalContributions.toLocaleString()}</span>
        <span className="ml-1.5 text-white/40">CONTRIBUTIONS · {year}</span>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur text-white/70">
          <span className="font-semibold text-white">{stats.currentStreak}</span>
          <span className="ml-1 text-white/40">DAY STREAK</span>
        </div>
        <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur text-white/70">
          <span className="font-semibold text-white">{stats.longestStreak}</span>
          <span className="ml-1 text-white/40">BEST</span>
        </div>
        {stats.mostProductiveMonth && (
          <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur text-white/70">
            <span className="font-semibold text-white">{stats.mostProductiveMonth.month.toUpperCase()}</span>
            <span className="ml-1 text-white/40">PEAK</span>
          </div>
        )}
      </div>
    </div>
  );
}
