"use client";

import { useMemo, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { ContributionCalendar, ContributionDay } from "@/types/github";
import { palette, getStructureColor, getNormalizedHeight } from "@/lib/colors";
import Ground from "./Ground";

// Shared geometries — single instance for all tiles/structures (perf)
const tileGeo = new THREE.BoxGeometry(0.88, 0.06, 0.88);
const structGeo = new THREE.BoxGeometry(0.68, 1, 0.68);
const edgeGeo = new THREE.EdgesGeometry(structGeo);

const CELL = 1.02;
const TILE_H = 0.06;
const MAX_H = 5.6;
const MIN_H = 0.0;

type Props = {
  calendar: ContributionCalendar;
  revealIndex?: number;
  onHover?: (day: ContributionDay | null) => void;
};

function DataTile({
  day,
  x,
  z,
  h,
  normalized,
  isHovered,
  dimmed,
  onHover,
}: {
  day: ContributionDay;
  x: number;
  z: number;
  h: number;
  normalized: number;
  isHovered: boolean;
  dimmed: boolean;
  onHover: (d: ContributionDay | null) => void;
}) {
  const col = getStructureColor(normalized);
  const lift = isHovered ? 0.14 : 0;
  const emissiveIntensity = isHovered ? 1.05 + normalized * 0.7 : 0.22 + normalized * 0.78;
  const opacity = dimmed ? 0.28 : normalized === 0 ? 0.42 : 0.58 + normalized * 0.28;

  return (
    <group
      position={[x, lift, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(day);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "auto";
        onHover(null);
      }}
    >
      {/* base tile — translucent glass */}
      <mesh position={[0, TILE_H / 2, 0]} geometry={tileGeo} receiveShadow>
        <meshPhysicalMaterial
          color={palette.tile}
          emissive={palette.tileEmissive}
          emissiveIntensity={isHovered ? 0.55 : 0.22}
          roughness={0.18}
          metalness={0.08}
          transmission={0.58}
          thickness={0.35}
          transparent
          opacity={dimmed ? 0.22 : 0.45}
          clearcoat={1}
          clearcoatRoughness={0.22}
        />
      </mesh>
      {/* tile edge highlight */}
      <lineSegments position={[0, TILE_H / 2, 0]}>
        <edgesGeometry args={[tileGeo]} />
        <lineBasicMaterial color={palette.tileEdge} transparent opacity={dimmed ? 0.08 : 0.18} />
      </lineSegments>

      {h > 0.01 && (
        <group position={[0, TILE_H + h / 2, 0]}>
          <mesh geometry={structGeo} scale={[1, h, 1]} castShadow>
            <meshPhysicalMaterial
              color={col}
              emissive={col}
              emissiveIntensity={emissiveIntensity}
              roughness={0.1}
              metalness={0.06}
              transmission={0.28}
              thickness={0.6}
              transparent
              opacity={opacity}
              clearcoat={1}
              clearcoatRoughness={0.12}
            />
          </mesh>
          {/* subtle edge — holographic */}
          <lineSegments scale={[1, h, 1]}>
            <primitive object={edgeGeo} attach="geometry" />
            <lineBasicMaterial color={isHovered ? "#ffffff" : col} transparent opacity={isHovered ? 0.42 : 0.16} />
          </lineSegments>
          {/* peak beacon for extreme */}
          {normalized > 0.88 && (
            <mesh position={[0, h / 2 + 0.08, 0]}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <meshStandardMaterial color={palette.peakHot} emissive={palette.peakHot} emissiveIntensity={1.4} transparent opacity={dimmed ? 0.4 : 0.95} />
            </mesh>
          )}
          {/* hover point light */}
          {isHovered && normalized > 0.12 && (
            <pointLight intensity={1.1} color={col} distance={2.8} decay={2} position={[0, 0, 0]} />
          )}
          {/* 3D tooltip anchored to structure top */}
          {isHovered && (
            <Html
              position={[0, h / 2 + 0.42, 0]}
              center
              distanceFactor={10}
              style={{ pointerEvents: "none" }}
              transform={false}
            >
              <div className="pointer-events-none min-w-[124px] rounded-xl border border-white/10 bg-[#0a0f1e]/92 px-3 py-2 text-center shadow-[0_8px_28px_rgba(0,0,0,0.6),0_0_18px_rgba(110,80,255,0.18)] backdrop-blur-xl">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-white/45">
                  {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                </div>
                <div className="mt-0.5 text-xs font-medium text-white">
                  {day.count} {day.count === 1 ? "contribution" : "contributions"}
                </div>
              </div>
            </Html>
          )}
        </group>
      )}
    </group>
  );
}

export default function DataTerrain({ calendar, revealIndex, onHover }: Props) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const allCounts = useMemo(() => calendar.days.map((d) => d.count), [calendar]);
  const totalWeeks = calendar.weeks.length;
  const width = totalWeeks * CELL;
  const depth = 7 * CELL;
  const offsetX = -(width / 2);
  const offsetZ = -(depth / 2);

  // Build ordered list for reveal
  const ordered = useMemo(() => {
    const arr: { day: ContributionDay; wi: number; di: number }[] = [];
    calendar.weeks.forEach((w, wi) => w.days.forEach((d, di) => arr.push({ day: d, wi, di })));
    if (revealIndex !== undefined) return arr.slice(0, revealIndex + 1);
    return arr;
  }, [calendar, revealIndex]);

  // month separators — extra gap after month boundary
  const monthBoundaries = useMemo(() => {
    const set = new Set<number>();
    let lastMonth = -1;
    calendar.weeks.forEach((w, wi) => {
      const d = w.days.find((x) => x.date);
      if (!d) return;
      const m = new Date(d.date + "T00:00:00").getMonth();
      if (m !== lastMonth) {
        if (wi !== 0) set.add(wi);
        lastMonth = m;
      }
    });
    return set;
  }, [calendar]);

  const handleHover = (d: ContributionDay | null) => {
    setHoveredDate(d?.date ?? null);
    onHover?.(d);
  };

  // compute month label positions
  const monthLabels = useMemo(() => {
    const labels: { name: string; x: number }[] = [];
    let lastM = -1;
    calendar.weeks.forEach((w, wi) => {
      const first = w.days[0];
      if (!first) return;
      const m = new Date(first.date + "T00:00:00").getMonth();
      if (m !== lastM) {
        labels.push({ name: new Date(first.date + "T00:00:00").toLocaleString("en-US", { month: "short" }).toUpperCase(), x: offsetX + wi * CELL + CELL / 2 });
        lastM = m;
      }
    });
    return labels;
  }, [calendar, offsetX]);

  return (
    <group>
      <Ground width={width} depth={depth} />

      {/* subtle holographic grid */}
      <gridHelper args={[width + 2, 24, palette.grid, palette.gridHolo]} position={[0, 0.015, 0]} />
      <gridHelper args={[width + 2, 48, palette.gridHolo, palette.bgNavy]} position={[0, 0.02, 0]} />

      {/* month separators */}
      {Array.from(monthBoundaries).map((wi) => (
        <mesh key={wi} position={[offsetX + wi * CELL - CELL * 0.42, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, depth + 0.8]} />
          <meshBasicMaterial color="#2a4b8a" transparent opacity={0.14} />
        </mesh>
      ))}

      {/* tiles + structures */}
      {ordered.map(({ day, wi, di }) => {
        const normalized = getNormalizedHeight(day.count, allCounts);
        const h = normalized === 0 ? 0 : MIN_H + normalized * MAX_H;
        // add month gap offset
        let extra = 0;
        for (const b of monthBoundaries) if (wi >= b) extra += 0.14;
        const x = offsetX + wi * CELL + CELL / 2 + extra;
        const z = offsetZ + di * CELL + CELL / 2;
        const isHovered = hoveredDate === day.date;
        const dimmed = hoveredDate !== null && !isHovered;
        return (
          <DataTile
            key={day.date}
            day={day}
            x={x}
            z={z}
            h={h}
            normalized={normalized}
            isHovered={isHovered}
            dimmed={dimmed}
            onHover={handleHover}
          />
        );
      })}

      {/* floating month labels — thin white low-opacity */}
      {monthLabels.map((m) => {
        let extra = 0;
        for (const b of monthBoundaries) if (m.x >= offsetX + (b as number) * CELL) extra += 0.14;
        return (
          <group key={m.name + m.x} position={[m.x + extra, 0.06, -5.6]}>
            {/* label via Html for crisp low-opacity text */}
            <Html center distanceFactor={12} style={{ pointerEvents: "none" } as React.CSSProperties}>
              <div className="whitespace-nowrap text-[9px] font-medium tracking-[0.16em] text-white/28">{m.name}</div>
            </Html>
          </group>
        );
      })}

      {/* data labels — subtle */}
      <group position={[0, 0.06, 5.9]}>
        <Html center distanceFactor={12} style={{ pointerEvents: "none" } as React.CSSProperties}>
          <div className="text-center">
            <div className="text-[8px] tracking-[0.18em] text-white/22">CONTRIBUTIONS</div>
            <div className="mt-0.5 text-[8px] tracking-wide text-white/14">weeks →</div>
          </div>
        </Html>
      </group>
    </group>
  );
}
