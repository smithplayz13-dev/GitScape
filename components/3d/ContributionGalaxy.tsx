"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ContributionCalendar } from "@/types/github";
import Ground from "./Ground";

const CELL = 1.0;
const MAX_LIFT = 6.5;

export default function ContributionGalaxy({ calendar }: { calendar: ContributionCalendar }) {
  const pointsRef = useRef<THREE.Points>(null);
  const maxCount = useMemo(() => Math.max(...calendar.days.map((d) => d.count), 1), [calendar]);
  const totalWeeks = calendar.weeks.length;
  const width = totalWeeks * CELL;
  const depth = 7 * CELL;
  const offsetX = -(width / 2);
  const offsetZ = -(depth / 2);

  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const size: number[] = [];

    calendar.weeks.forEach((w, wi) => {
      w.days.forEach((day, di) => {
        if (day.count === 0) return;
        const normalized = day.count / maxCount;
        // particle count per day scales with activity (1-6 particles per active day)
        const pCount = Math.max(1, Math.round(normalized * 6));
        const baseX = offsetX + wi * CELL + CELL / 2;
        const baseZ = offsetZ + di * CELL + CELL / 2;
        const baseY = 0.18 + Math.pow(normalized, 0.9) * MAX_LIFT;

        for (let p = 0; p < pCount; p++) {
          const jitterX = (Math.random() - 0.5) * 0.38;
          const jitterZ = (Math.random() - 0.5) * 0.38;
          const jitterY = (Math.random() - 0.5) * 0.7 + Math.random() * normalized * 0.6;
          pos.push(baseX + jitterX, baseY + jitterY, baseZ + jitterZ);

          const colr = new THREE.Color();
          // green shifted by intensity — low yellow-green, high pure green
          colr.setHSL(0.36 - normalized * 0.06, 0.92, 0.32 + normalized * 0.28);
          col.push(colr.r, colr.g, colr.b);
          size.push(0.08 + normalized * 0.18 + Math.random() * 0.06);
        }
      });
    });
    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
    };
  }, [calendar, maxCount, offsetX, offsetZ]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    // slow drift — subtle breathing
    pointsRef.current.rotation.y = Math.sin(t * 0.04) * 0.02;
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    // twinkle via opacity subtle
    mat.opacity = 0.9 + Math.sin(t * 0.9) * 0.06;
  });

  return (
    <group>
      <Ground width={width} depth={depth} />
      {/* faint holographic calendar grid underneath */}
      <gridHelper args={[Math.max(width + 2, 22), 26, "#0d2414", "#0a1c10"]} position={[0, 0.01, 0]} />

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.14}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* core glow under densest weeks */}
      {calendar.weeks.map((w, wi) => {
        const weekTotal = w.days.reduce((s, d) => s + d.count, 0);
        if (weekTotal < maxCount * 0.9) return null;
        const x = offsetX + wi * CELL + CELL / 2;
        return (
          <mesh key={wi} position={[x, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.42, 16]} />
            <meshBasicMaterial color="#39d353" transparent opacity={0.09} />
          </mesh>
        );
      })}
    </group>
  );
}
