"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { ContributionDay } from "@/types/github";
import { getColorForLevel, getEmissiveForLevel } from "@/lib/colors";

type Props = {
  day: ContributionDay;
  x: number;
  z: number;
  height: number;
  maxCount: number;
  hovered: boolean;
  dimmed: boolean;
  onHover: (day: ContributionDay | null, pos: { x: number; y: number } | null) => void;
  revealProgress?: number; // 0-1 for replay
};

function seededRand(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), h | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ContributionStructure({
  day,
  x,
  z,
  height,
  hovered,
  dimmed,
  onHover,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const rand = useMemo(() => seededRand(day.date), [day.date]);
  const r1 = rand();
  const r2 = rand();
  const jitter = (rand() - 0.5) * 0.06;

  const level = day.level;

  // variant selection — controlled variation, coherent
  const variant = useMemo(() => {
    if (level === 0) return "plate";
    if (level === 1) return r1 > 0.5 ? "cottage" : "block";
    if (level === 2) return r1 > 0.6 ? "towerA" : "towerB";
    if (level === 3) return r1 > 0.5 ? "spireA" : "setback";
    return r1 > 0.55 ? "landmark" : "monolith";
  }, [level, r1]);

  const baseColor = getColorForLevel(level, hovered);
  const emissive = getEmissiveForLevel(level);

  const scaleY = hovered ? 1.06 : 1;
  const lift = hovered ? 0.12 : 0;

  const opacity = dimmed ? 0.35 : 1;

  // sizes — keep within cell (CELL=1.0, BAR 0.85). Jitter keeps readability.
  const footprint = level === 0 ? 0.92 : 0.72 + r2 * 0.18;

  return (
    <group
      ref={groupRef}
      position={[x + jitter, height / 2 + lift, z + jitter * 0.5]}
      scale={[1, scaleY, 1]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        const native = e.nativeEvent as unknown as PointerEvent;
        const cx = (native as unknown as { clientX?: number }).clientX ?? 0;
        const cy = (native as unknown as { clientY?: number }).clientY ?? 0;
        onHover(day, { x: cx, y: cy });
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
        onHover(null, null);
      }}
    >
      {/* dimming via material opacity handled per mesh transparent */}
      {level === 0 ? (
        <mesh position={[0, -height / 2 + 0.06, 0]}>
          <boxGeometry args={[footprint, 0.12, footprint]} />
          <meshStandardMaterial
            color={baseColor}
            emissive="#000000"
            roughness={0.9}
            metalness={0.05}
            transparent
            opacity={opacity * 0.9}
          />
        </mesh>
      ) : (
        <>
          {/* main mass */}
          <mesh position={[0, -height / 2 + height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[footprint, height, footprint]} />
            <meshStandardMaterial
              color={baseColor}
              emissive={hovered ? emissive : level >= 3 ? emissive : "#000000"}
              emissiveIntensity={hovered ? 0.9 : level === 4 ? 0.55 : level === 3 ? 0.32 : 0.12}
              roughness={0.42}
              metalness={0.18}
              transparent
              opacity={opacity}
            />
          </mesh>

          {/* architectural details — keep minimal but distinctive */}
          {variant === "towerA" && (
            <mesh position={[0, -height / 2 + height * 0.92, 0]}>
              <boxGeometry args={[footprint * 0.72, height * 0.18, footprint * 0.72]} />
              <meshStandardMaterial
                color={baseColor}
                emissive={emissive}
                emissiveIntensity={0.18}
                roughness={0.35}
                transparent
                opacity={opacity}
              />
            </mesh>
          )}
          {variant === "spireA" && (
            <>
              <mesh position={[0, height / 2 - 0.18, 0]}>
                <boxGeometry args={[footprint * 0.62, 0.36, footprint * 0.62]} />
                <meshStandardMaterial color={baseColor} roughness={0.3} transparent opacity={opacity} />
              </mesh>
              <mesh position={[0, height / 2 + 0.22, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.9, 6]} />
                <meshStandardMaterial color="#e8ffe8" emissive="#39d353" emissiveIntensity={0.9} transparent opacity={opacity} />
              </mesh>
            </>
          )}
          {variant === "setback" && (
            <mesh position={[0, height * 0.18, 0]}>
              <boxGeometry args={[footprint * 1.02, height * 0.5, footprint * 1.02]} />
              <meshStandardMaterial color={baseColor} emissive={emissive} emissiveIntensity={0.16} transparent opacity={opacity} />
            </mesh>
          )}
          {variant === "landmark" && (
            <>
              <mesh position={[0, -height / 2 + height * 0.78, 0]}>
                <boxGeometry args={[footprint * 0.58, height * 0.44, footprint * 0.58]} />
                <meshStandardMaterial
                  color="#d7ffe0"
                  emissive="#39d353"
                  emissiveIntensity={0.35}
                  transparent
                  opacity={opacity * 0.95}
                />
              </mesh>
              <mesh position={[0, height / 2 + 0.35, 0]}>
                <cylinderGeometry args={[0.04, 0.06, 1.1, 8]} />
                <meshStandardMaterial color="#ffffff" emissive="#39d353" emissiveIntensity={0.85} transparent opacity={opacity} />
              </mesh>
              <pointLight position={[0, height / 2 + 0.6, 0]} intensity={hovered ? 1.8 : 0.9} color="#39d353" distance={3.5} decay={2} />
            </>
          )}
          {variant === "monolith" && height > 3.5 && (
            <mesh position={[0, -height / 2 + height * 0.62, 0]}>
              <boxGeometry args={[footprint * 0.5, height * 0.58, footprint * 0.5]} />
              <meshStandardMaterial color="#c6f5d0" emissive="#39d353" emissiveIntensity={0.28} transparent opacity={opacity} />
            </mesh>
          )}

          {/* windows — horizontal strips, subtle emissive */}
          {level >= 2 && (
            <mesh position={[footprint / 2 + 0.01, -height / 2 + height * 0.55, 0]}>
              <planeGeometry args={[0.02, height * 0.52]} />
              <meshStandardMaterial color="#001008" emissive="#39d353" emissiveIntensity={level === 4 ? 0.45 : 0.22} transparent opacity={opacity * 0.9} />
            </mesh>
          )}
          {level >= 3 && (
            <mesh position={[-footprint / 2 - 0.01, -height / 2 + height * 0.55, 0]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[0.02, height * 0.48]} />
              <meshStandardMaterial color="#001008" emissive="#39d353" emissiveIntensity={0.22} transparent opacity={opacity * 0.9} />
            </mesh>
          )}

          {/* beacon for medium+ */}
          {level >= 2 && (
            <mesh position={[0, height / 2 + 0.06, 0]}>
              <boxGeometry args={[0.14, 0.08, 0.14]} />
              <meshStandardMaterial color="#eaffea" emissive="#39d353" emissiveIntensity={hovered ? 1.2 : 0.7} transparent opacity={opacity} />
            </mesh>
          )}
        </>
      )}

      {/* hover ring */}
      {hovered && (
        <mesh position={[0, -height / 2 - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[footprint * 0.62, footprint * 0.78, 16]} />
          <meshBasicMaterial color="#39d353" transparent opacity={0.22} />
        </mesh>
      )}
    </group>
  );
}
