"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { generateMockCalendar } from "@/lib/mock";
import ContributionGrid from "./ContributionGrid";

export default function HeroDemo() {
  const calendar = useMemo(() => generateMockCalendar(new Date().getFullYear(), 7), []);

  // No tooltip needed in hero demo to keep it subtle; hover still works but we suppress tooltip
  return (
    <div className="absolute inset-0 opacity-[0.55]">
      <Canvas camera={{ position: [16, 12, 16], fov: 34 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={["#05080b"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 14, 6]} intensity={1} />
        <ContributionGrid calendar={calendar} onHover={() => {}} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.6}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 3}
        />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-[#05080b] via-[#05080b]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05080b] via-transparent to-transparent opacity-60" />
    </div>
  );
}
