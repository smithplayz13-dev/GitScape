"use client";

import { Stars } from "@react-three/drei";

export default function Environment() {
  return (
    <>
      <color attach="background" args={["#05080b"]} />
      <fog attach="fog" args={["#05080b", 24, 52]} />
      {/* ambient very low to keep near-black */}
      <ambientLight intensity={0.55} color="#cfe8d8" />
      <directionalLight
        position={[14, 20, 10]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
      />
      <directionalLight position={[-12, 12, -10]} intensity={0.28} color="#7ab88f" />
      {/* subtle green point light in city centre */}
      <pointLight position={[0, 9, 0]} intensity={0.7} color="#39d353" distance={28} decay={2} />
      {/* rim light */}
      <pointLight position={[0, 2, -14]} intensity={0.35} color="#1a4d2a" distance={24} />
      <Stars radius={80} depth={40} count={1800} factor={3.2} saturation={0} fade speed={0.3} />
    </>
  );
}
