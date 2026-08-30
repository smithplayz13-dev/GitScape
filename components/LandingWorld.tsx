"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { generateMockCalendar } from "@/lib/mock";
import ContributionCity from "./3d/ContributionCity";
import Environment from "./3d/Environment";

export default function LandingWorld() {
  const calendar = useMemo(() => generateMockCalendar(new Date().getFullYear(), 7), []);
  return (
    <div className="absolute inset-0 opacity-[0.62]">
      <Canvas camera={{ position: [20, 14, 18], fov: 32 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <Environment />
        <ContributionCity calendar={calendar} onHover={() => {}} />
        <OrbitControls autoRotate autoRotateSpeed={0.45} enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#05080b] via-[#05080b]/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05080b] via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#05080b]/70" />
    </div>
  );
}
