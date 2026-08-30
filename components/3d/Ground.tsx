"use client";

type Props = {
  width: number;
  depth: number;
};

export default function Ground({ width, depth }: Props) {
  return (
    <group>
      {/* extremely subtle ground plane — nearly black with soft roughness */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[width + 6, depth + 6]} />
        <meshStandardMaterial color="#070a0f" roughness={0.92} metalness={0.02} />
      </mesh>

      {/* holographic grid — ultra-thin */}
      <gridHelper args={[Math.max(width + 2, 22), 22, "#11202a", "#0c1720"]} position={[0, 0.01, 0]} />

      {/* secondary fine grid for sci-fi feel */}
      <gridHelper args={[Math.max(width + 2, 22), 44, "#0c1820", "#0a141c"]} position={[0, 0.015, 0]} />

      {/* outer rim glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[Math.max(width, depth) * 0.55, Math.max(width, depth) * 0.78, 64]} />
        <meshBasicMaterial color="#0f2a1a" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}
