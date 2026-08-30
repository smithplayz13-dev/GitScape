"use client";

import { useMemo, useState } from "react";
import type { ContributionCalendar, ContributionDay } from "@/types/github";
import ContributionStructure from "./ContributionStructure";
import Ground from "./Ground";
import MonthLabels from "./MonthLabels";

type Props = {
  calendar: ContributionCalendar;
  onHover: (day: ContributionDay | null, pos: { x: number; y: number } | null) => void;
  revealIndex?: number; // for replay — only show up to this index
  dimOthers?: boolean;
};

const CELL = 1.0;
const MAX_HEIGHT = 6.2;
const MIN_HEIGHT = 0.08;

export default function ContributionCity({ calendar, onHover, revealIndex }: Props) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const maxCount = useMemo(() => Math.max(...calendar.days.map((d) => d.count), 1), [calendar]);

  const totalWeeks = calendar.weeks.length;
  const width = totalWeeks * CELL;
  const depth = 7 * CELL;
  const offsetX = -(width / 2);
  const offsetZ = -(depth / 2);

  const handleHover = (day: ContributionDay | null, pos: { x: number; y: number } | null) => {
    setHoveredDate(day?.date ?? null);
    onHover(day, pos);
  };

  // flatten with reveal filter
  const visible = useMemo(() => {
    const all: { day: ContributionDay; wi: number; di: number }[] = [];
    calendar.weeks.forEach((w, wi) =>
      w.days.forEach((d, di) => all.push({ day: d, wi, di }))
    );
    if (revealIndex !== undefined) return all.slice(0, revealIndex + 1);
    return all;
  }, [calendar, revealIndex]);

  return (
    <group>
      <Ground width={width} depth={depth} />
      <MonthLabels weeks={calendar.weeks} offsetX={offsetX} cell={CELL} />

      {/* subtle week separators — holographic thin lines */}
      {calendar.weeks.map((_, wi) => {
        if (wi % 4 !== 0) return null; // month-ish separation every 4 weeks
        const x = offsetX + wi * CELL;
        return (
          <mesh key={wi} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, depth]} />
            <meshBasicMaterial color="#1f4d2d" transparent opacity={0.14} />
          </mesh>
        );
      })}

      {visible.map(({ day, wi, di }) => {
        const normalized = day.count / maxCount;
        const h =
          day.count === 0 ? MIN_HEIGHT : MIN_HEIGHT + Math.pow(normalized, 0.82) * (MAX_HEIGHT - MIN_HEIGHT);
        const x = offsetX + wi * CELL + CELL / 2;
        const z = offsetZ + di * CELL + CELL / 2;
        const isHovered = hoveredDate === day.date;
        const dimmed = hoveredDate !== null && !isHovered;
        // replay reveal animation — scale from 0
        return (
          <ContributionStructure
            key={day.date}
            day={day}
            x={x}
            z={z}
            height={h}
            maxCount={maxCount}
            hovered={isHovered}
            dimmed={dimmed}
            onHover={handleHover}
          />
        );
      })}
    </group>
  );
}
