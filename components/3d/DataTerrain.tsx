"use client";

import { useMemo, useState, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ContributionCalendar, ContributionDay } from "@/types/github";
import { palette, getStructureColor, getNormalizedHeight } from "@/lib/colors";
import Ground from "./Ground";

// Shared geometries
const tileGeo = new THREE.BoxGeometry(0.88, 0.06, 0.88);
const outerGeo = new THREE.BoxGeometry(0.68, 1, 0.68);
const innerGeo = new THREE.BoxGeometry(0.38, 1, 0.38);
const haloGeo = new THREE.RingGeometry(0.32, 0.52, 22);
const tileEdgeGeo = new THREE.EdgesGeometry(tileGeo);
const outerEdgeGeo = new THREE.EdgesGeometry(outerGeo);

const CELL = 1.02;
const TILE_H = 0.06;
const MAX_H = 5.6;

type TileProps = {
  day: ContributionDay;
  x: number;
  z: number;
  h: number;
  normalized: number;
  isHovered: boolean;
  dimmed: boolean;
  onHover: (d: ContributionDay | null) => void;
};

function DataTile({ day, x, z, h, normalized, isHovered, dimmed, onHover }: TileProps) {
  const groupRef = useRef<THREE.Group>(null);
  const outerMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const innerMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const tileMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const col = getStructureColor(normalized);
  const innerCol = normalized > 0.66 ? palette.peakHot : normalized > 0.33 ? palette.high : palette.low;

  // target lift — smooth via frame
  const targetLift = isHovered ? 0.16 : 0;
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.y += (targetLift - groupRef.current.position.y) * 0.18;
    if (outerMatRef.current) {
      const targetEmissive = isHovered ? 0.95 + normalized * 0.85 : 0.18 + normalized * 0.95;
      outerMatRef.current.emissiveIntensity += (targetEmissive - outerMatRef.current.emissiveIntensity) * 0.16;
    }
    if (innerMatRef.current) {
      const targetInner = isHovered ? 1.45 + normalized * 0.7 : normalized < 0.12 ? 0.45 : 0.9 + normalized * 0.85;
      innerMatRef.current.emissiveIntensity += (targetInner - innerMatRef.current.emissiveIntensity) * 0.18;
    }
    if (tileMatRef.current) {
      const targetTile = isHovered ? 0.62 : 0.22;
      tileMatRef.current.emissiveIntensity += (targetTile - tileMatRef.current.emissiveIntensity) * 0.18;
    }
  });

  const outerOpacity = dimmed ? 0.22 : 0.48 + normalized * 0.32;
  const innerOpacity = dimmed ? 0.28 : normalized < 0.12 ? 0.55 : 0.82;

  // halo scale tied to intensity + hover
  const haloScale = (0.9 + normalized * 0.9) * (isHovered ? 1.28 : 1);
  const haloOpacity = dimmed ? 0.04 : normalized < 0.15 ? 0 : isHovered ? 0.22 : 0.12 + normalized * 0.14;

  return (
    <group
      ref={groupRef}
      position={[x, 0, z]}
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
      {/* base tile — translucent blue glass */}
      <mesh position={[0, TILE_H / 2, 0]} geometry={tileGeo} receiveShadow>
        <meshPhysicalMaterial
          ref={tileMatRef}
          color={palette.tile}
          emissive={palette.tileEmissive}
          emissiveIntensity={0.22}
          roughness={0.16}
          metalness={0.07}
          transmission={0.62}
          thickness={0.38}
          transparent
          opacity={dimmed ? 0.2 : 0.46}
          clearcoat={1}
          clearcoatRoughness={0.2}
        />
      </mesh>
      <lineSegments position={[0, TILE_H / 2, 0]}>
        <primitive object={tileEdgeGeo} attach="geometry" />
        <lineBasicMaterial color={palette.tileEdge} transparent opacity={dimmed ? 0.07 : isHovered ? 0.42 : 0.16} />
      </lineSegments>

      {/* halo — soft light spill on terrain for medium+ */}
      {normalized > 0.12 && (
        <mesh position={[0, TILE_H + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[haloScale, haloScale, 1]}>
          <primitive object={haloGeo} attach="geometry" />
          <meshBasicMaterial color={col} transparent opacity={haloOpacity} depthWrite={false} />
        </mesh>
      )}

      {h > 0.01 && (
        <group position={[0, TILE_H + h / 2, 0]}>
          {/* outer glass shell — translucent, outer glow */}
          <mesh geometry={outerGeo} scale={[1, h, 1]} castShadow>
            <meshPhysicalMaterial
              ref={outerMatRef}
              color={col}
              emissive={col}
              emissiveIntensity={0.18 + normalized * 0.95}
              roughness={0.08}
              metalness={0.05}
              transmission={0.42}
              thickness={0.72}
              transparent
              opacity={outerOpacity}
              clearcoat={1}
              clearcoatRoughness={0.1}
              depthWrite={false}
            />
          </mesh>
          {/* inner luminous core — bright center */}
          <mesh geometry={innerGeo} scale={[1, h * 0.94, 1]}>
            <meshPhysicalMaterial
              ref={innerMatRef}
              color={innerCol}
              emissive={innerCol}
              emissiveIntensity={0.9 + normalized * 0.85}
              roughness={0.22}
              metalness={0}
              transmission={0.12}
              transparent
              opacity={innerOpacity}
              depthWrite={false}
            />
          </mesh>
          {/* vertical gradient overlay — subtle top brighter via second inner cap */}
          {normalized > 0.5 && (
            <mesh position={[0, h * 0.28, 0]} scale={[0.92, h * 0.46, 0.92]}>
              <boxGeometry args={[0.42, 1, 0.42]} />
              <meshBasicMaterial color={palette.peak} transparent opacity={dimmed ? 0 : 0.07 + normalized * 0.09} depthWrite={false} />
            </mesh>
          )}
          {/* edge holographic */}
          <lineSegments scale={[1, h, 1]}>
            <primitive object={outerEdgeGeo} attach="geometry" />
            <lineBasicMaterial color={isHovered ? "#ffffff" : col} transparent opacity={isHovered ? 0.48 : 0.18} depthWrite={false} />
          </lineSegments>

          {/* peak beacon for extreme */}
          {normalized > 0.88 && (
            <mesh position={[0, h / 2 + 0.09, 0]}>
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshStandardMaterial color={palette.peakHot} emissive={palette.peakHot} emissiveIntensity={1.6} transparent opacity={dimmed ? 0.4 : 1} />
            </mesh>
          )}

          {/* persistent light spill for high towers — subtle pink/purple illumination on nearby terrain */}
          {normalized > 0.18 && (
            <pointLight
              intensity={dimmed ? 0.08 : 0.55 + normalized * 1.25 + (isHovered ? 0.9 : 0)}
              color={col}
              distance={2.6 + normalized * 2.2}
              decay={2}
              position={[0, 0, 0]}
            />
          )}

          {/* 3D tooltip anchored at top */}
          {isHovered && (
            <Html position={[0, h / 2 + 0.48, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }} transform={false}>
              <div className="pointer-events-none min-w-[124px] rounded-xl border border-white/10 bg-[#0a0f1e]/93 px-3 py-2 text-center shadow-[0_8px_28px_rgba(0,0,0,0.65),0_0_22px_rgba(110,80,255,0.22)] backdrop-blur-xl">
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

export default function DataTerrain({ calendar, revealIndex, onHover }: { calendar: ContributionCalendar; revealIndex?: number; onHover?: (day: ContributionDay | null) => void }) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const allCounts = useMemo(() => calendar.days.map((d) => d.count), [calendar]);
  const totalWeeks = calendar.weeks.length;
  const width = totalWeeks * CELL;
  const depth = 7 * CELL;
  const offsetX = -(width / 2);
  const offsetZ = -(depth / 2);

  const ordered = useMemo(() => {
    const arr: { day: ContributionDay; wi: number; di: number }[] = [];
    calendar.weeks.forEach((w, wi) => w.days.forEach((d, di) => arr.push({ day: d, wi, di })));
    if (revealIndex !== undefined) return arr.slice(0, revealIndex + 1);
    return arr;
  }, [calendar, revealIndex]);

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

      <gridHelper args={[width + 2, 24, palette.grid, palette.gridHolo]} position={[0, 0.015, 0]} />
      <gridHelper args={[width + 2, 48, palette.gridHolo, palette.bgNavy]} position={[0, 0.02, 0]} />

      {Array.from(monthBoundaries).map((wi) => (
        <mesh key={wi} position={[offsetX + wi * CELL - CELL * 0.42, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.03, depth + 0.8]} />
          <meshBasicMaterial color="#2a4b8a" transparent opacity={0.14} />
        </mesh>
      ))}

      {ordered.map(({ day, wi, di }) => {
        const normalized = getNormalizedHeight(day.count, allCounts);
        const h = normalized === 0 ? 0 : normalized * MAX_H;
        let extra = 0;
        for (const b of monthBoundaries) if (wi >= b) extra += 0.14;
        const x = offsetX + wi * CELL + CELL / 2 + extra;
        const z = offsetZ + di * CELL + CELL / 2;
        const isHovered = hoveredDate === day.date;
        const dimmed = hoveredDate !== null && !isHovered;
        return <DataTile key={day.date} day={day} x={x} z={z} h={h} normalized={normalized} isHovered={isHovered} dimmed={dimmed} onHover={handleHover} />;
      })}

      {monthLabels.map((m) => {
        let extra = 0;
        for (const b of monthBoundaries) if (m.x >= offsetX + (b as number) * CELL) extra += 0.14;
        return (
          <group key={m.name + m.x} position={[m.x + extra, 0.06, -5.6]}>
            <Html center distanceFactor={12} style={{ pointerEvents: "none" } as React.CSSProperties}>
              <div className="whitespace-nowrap text-[9px] font-medium tracking-[0.16em] text-white/28">{m.name}</div>
            </Html>
          </group>
        );
      })}

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
