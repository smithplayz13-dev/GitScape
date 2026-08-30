"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { ContributionCalendar } from "@/types/github";
import { getTerrainColor } from "@/lib/colors";
import Ground from "./Ground";

const CELL = 1.0;
const MAX_HEIGHT = 5.4;
const MIN_HEIGHT = 0.06;

export default function ContributionTerrain({ calendar }: { calendar: ContributionCalendar }) {
  const maxCount = useMemo(() => Math.max(...calendar.days.map((d) => d.count), 1), [calendar]);
  const totalWeeks = calendar.weeks.length;
  const width = totalWeeks * CELL;
  const depth = 7 * CELL;
  const offsetX = -(width / 2);
  const offsetZ = -(depth / 2);

  // Build a heightmap plane — each week/day is a vertex
  const { geometry } = useMemo(() => {
    const wSeg = totalWeeks;
    const hSeg = 7;
    const geo = new THREE.PlaneGeometry(width, depth, wSeg, hSeg);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const col: number[] = [];

    // Map plane vertices to calendar days — plane is centered at 0,0
    // Plane vertices are row-major: y (depth) varies slowest? We'll brute map by nearest week/day
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // convert world x/z to week/day index
      const wi = Math.round((x - offsetX - CELL / 2) / CELL);
      const di = Math.round((z - offsetZ - CELL / 2) / CELL);
      const clampedWi = Math.max(0, Math.min(totalWeeks - 1, wi));
      const clampedDi = Math.max(0, Math.min(6, di));
      const week = calendar.weeks[clampedWi];
      const day = week?.days[clampedDi];
      const count = day?.count ?? 0;
      const normalized = count / maxCount;
      const h = count === 0 ? MIN_HEIGHT : MIN_HEIGHT + Math.pow(normalized, 0.86) * (MAX_HEIGHT - MIN_HEIGHT);
      pos.setY(i, h * 0.55);

      const c = new THREE.Color(getTerrainColor(normalized));
      if (count === 0) c.multiplyScalar(0.55);
      col.push(c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    return { geometry: geo };
  }, [calendar, maxCount, width, depth, offsetX, offsetZ, totalWeeks]);

  return (
    <group>
      <Ground width={width} depth={depth} />
      <mesh geometry={geometry} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.78} metalness={0.08} />
      </mesh>

      {/* ridge lines — wireframe overlay very subtle */}
      <mesh geometry={geometry} position={[0, 0.02, 0]}>
        <meshBasicMaterial color="#0f2a18" wireframe transparent opacity={0.07} />
      </mesh>

      {/* peak beacons for high activity */}
      {calendar.days
        .filter((d) => d.count / maxCount > 0.72)
        .map((d) => {
          // find its position
          let wi = -1,
            di = -1;
          calendar.weeks.forEach((w, idx) => {
            const j = w.days.findIndex((x) => x.date === d.date);
            if (j !== -1) {
              wi = idx;
              di = j;
            }
          });
          if (wi === -1) return null;
          const normalized = d.count / maxCount;
          const h = MIN_HEIGHT + Math.pow(normalized, 0.86) * (MAX_HEIGHT - MIN_HEIGHT);
          const x = offsetX + wi * CELL + CELL / 2;
          const z = offsetZ + di * CELL + CELL / 2;
          return (
            <mesh key={d.date} position={[x, h * 0.55 + 0.22, z]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#39d353" emissive="#39d353" emissiveIntensity={1.1} />
            </mesh>
          );
        })}
    </group>
  );
}
