"use client";

import type { ContributionDay } from "@/types/github";

export default function ContributionTooltip({
  day,
  pos,
}: {
  day: ContributionDay | null;
  pos: { x: number; y: number } | null;
}) {
  if (!day || !pos) return null;

  const date = new Date(day.date + "T00:00:00");
  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const label = day.count === 1 ? "1 contribution" : `${day.count} contributions`;

  // clamp to viewport so tooltip doesn't overflow
  const x = Math.min(pos.x + 14, typeof window !== "undefined" ? window.innerWidth - 180 : pos.x + 14);
  const y = Math.max(pos.y - 56, 8);

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-lg border border-white/10 bg-[#0f1419]/95 px-3 py-2 text-xs leading-tight shadow-xl backdrop-blur-md"
      style={{ left: x, top: y }}
    >
      <div className="font-medium text-white/90">{formatted}</div>
      <div className="mt-0.5 text-white/60">{label}</div>
    </div>
  );
}
