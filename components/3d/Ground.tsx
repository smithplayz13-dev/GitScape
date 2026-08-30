"use client";

import { palette } from "@/lib/colors";

type Props = {
  width: number;
  depth: number;
};

export default function Ground({ width, depth }: Props) {
  return (
    <group>
      {/* near-black navy ground — almost invisible, just enough to catch shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} receiveShadow>
        <planeGeometry args={[width + 12, depth + 12]} />
        <meshStandardMaterial color={palette.bg} roughness={0.96} metalness={0.02} transparent opacity={0.98} />
      </mesh>
      {/* ultra-subtle outer fade */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.065, 0]}>
        <planeGeometry args={[width + 10, depth + 9]} />
        <meshBasicMaterial color={palette.bgNavy} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
