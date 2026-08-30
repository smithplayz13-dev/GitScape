"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { ContributionCalendar, ContributionDay } from "@/types/github";
import { getColorForLevel } from "@/lib/colors";

type Props = {
  calendar: ContributionCalendar;
  onHover: (day: ContributionDay | null, pos: { x: number; y: number } | null) => void;
};

const BAR_SIZE = 0.85;
const GAP = 0.15;
const CELL = BAR_SIZE + GAP;
const MAX_HEIGHT = 4.2;
const MIN_HEIGHT = 0.08;

// Single bar — memoized geometry per instance would be heavy; we pass data via props
function Bar({
  day,
  x,
  z,
  height,
  color,
  onHover,
}: {
  day: ContributionDay;
  x: number;
  z: number;
  height: number;
  color: string;
  onHover: Props["onHover"];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const hoveredRef = useRef(false);

  return (
    <mesh
      ref={meshRef}
      position={[x, height / 2, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        hoveredRef.current = true;
        // convert 3D to screen pos — we approximate by using pointer x/y from event
        // drei's event has pointer; but we also store world height for tooltip offset
        // We'll let parent compute tooltip via clientX/Y from native event
        const native = e.nativeEvent as unknown as PointerEvent;
        const cx = (native as unknown as { clientX?: number }).clientX ?? 0;
        const cy = (native as unknown as { clientY?: number }).clientY ?? 0;
        onHover(day, { x: cx, y: cy });
        if (meshRef.current) {
          (meshRef.current.material as THREE.MeshStandardMaterial).emissive.set("#1a2e22");
        }
      }}
      onPointerMove={(e) => {
        const native = e.nativeEvent as unknown as PointerEvent;
        const cx = (native as unknown as { clientX?: number }).clientX ?? 0;
        const cy = (native as unknown as { clientY?: number }).clientY ?? 0;
        onHover(day, { x: cx, y: cy });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "auto";
        hoveredRef.current = false;
        onHover(null, null);
        if (meshRef.current) {
          (meshRef.current.material as THREE.MeshStandardMaterial).emissive.set("#000000");
        }
      }}
    >
      <boxGeometry args={[BAR_SIZE, height, BAR_SIZE]} />
      <meshStandardMaterial
        color={color}
        emissive={"#000000"}
        emissiveIntensity={0.6}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
  );
}

export default function ContributionGrid({ calendar, onHover }: Props) {
  const maxCount = useMemo(
    () => Math.max(...calendar.days.map((d) => d.count), 1),
    [calendar]
  );

  // weeks are columns (x), days are rows (z). We center grid at origin.
  const totalWeeks = calendar.weeks.length;
  const offsetX = -((totalWeeks * CELL) / 2);
  const offsetZ = -((7 * CELL) / 2);

  const bars = useMemo(() => {
    const out: { day: ContributionDay; x: number; z: number; h: number; color: string }[] = [];
    calendar.weeks.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        // Skip padding days outside year that have maybe no date? But mock includes all.
        // We still render them; if day.date outside year but count 0, will be flat.
        const level = day.level;
        const color = getColorForLevel(level);
        // height: linear scaled, but use sqrt for better perception of spikes
        const normalized = day.count / maxCount;
        // ensure 0 -> MIN_HEIGHT, else sqrt curve
        const h = day.count === 0 ? MIN_HEIGHT : MIN_HEIGHT + Math.pow(normalized, 0.85) * (MAX_HEIGHT - MIN_HEIGHT);
        const x = offsetX + wi * CELL + CELL / 2;
        const z = offsetZ + di * CELL + CELL / 2;
        out.push({ day, x, z, h, color });
      });
    });
    return out;
  }, [calendar, maxCount, offsetX, offsetZ]);

  return (
    <group>
      {/* subtle ground plane with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[totalWeeks * CELL + 4, 7 * CELL + 4]} />
        <meshStandardMaterial color="#0a0f14" roughness={0.9} metalness={0} />
      </mesh>

      <gridHelper
        args={[Math.max(totalWeeks * CELL + 2, 20), 20, "#1a2530", "#111a24"]}
        position={[0, 0.01, 0]}
      />

      {bars.map((b) => (
        <Bar key={b.day.date} day={b.day} x={b.x} z={b.z} height={b.h} color={b.color} onHover={onHover} />
      ))}
    </group>
  );
}
