"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { generateMockCalendar } from "@/lib/mock";
import DataTerrain from "./3d/DataTerrain";
import Environment from "./3d/Environment";

export default function LandingTerrain() {
  const calendar = useMemo(() => generateMockCalendar(new Date().getFullYear(), 7), []);
  return (
    <div className="absolute inset-0 opacity-[0.58]">
      <Canvas camera={{ position: [20, 14.5, 18.5], fov: 31 }} dpr={[1, 1.4]} gl={{ antialias: true, alpha: false }}>
        <Environment />
        <group scale={[0.92, 0.92, 0.92]} position={[0, -0.3, 0]}>
          <DataTerrain calendar={calendar} />
        </group>
        <OrbitControls autoRotate autoRotateSpeed={0.38} enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#03070d] via-[#03070d]/48 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#03070d] via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#03070d]/30 via-transparent to-[#03070d]/30" />
    </div>
  );
}
