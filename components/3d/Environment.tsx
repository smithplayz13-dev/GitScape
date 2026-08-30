"use client";

import { palette } from "@/lib/colors";

export default function Environment() {
  return (
    <>
      <color attach="background" args={[palette.bg]} />
      <fog attach="fog" args={[palette.fog, 28, 58]} />
      {/* dark ambient — very low */}
      <ambientLight intensity={0.22} color="#1a2a4a" />
      {/* soft blue directional — key light */}
      <directionalLight
        position={[16, 22, 12]}
        intensity={1.15}
        color="#7ab6ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-14, 14, -10]} intensity={0.22} color="#4a6bff" />
      {/* subtle pink rim from opposite side */}
      <pointLight position={[-8, 6, -12]} intensity={0.45} color="#ff3b9a" distance={30} decay={2} />
      <pointLight position={[8, 4, 10]} intensity={0.32} color="#6a4bff" distance={26} decay={2} />
      {/* hemisphere for depth */}
      <hemisphereLight args={["#0a1a3a", "#020408", 0.28]} />
    </>
  );
}
