"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState } from "react";
import type { ContributionCalendar, ContributionDay } from "@/types/github";
import ContributionGrid from "./ContributionGrid";
import ContributionTooltip from "./ContributionTooltip";

type Props = {
  calendar: ContributionCalendar;
  autoRotate?: boolean;
};

export default function ContributionScene({ calendar, autoRotate = false }: Props) {
  const [hovered, setHovered] = useState<ContributionDay | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const handleHover = (day: ContributionDay | null, p: { x: number; y: number } | null) => {
    setHovered(day);
    setPos(p);
  };

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080c10] md:h-[520px]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [18, 14, 18], fov: 38 }}
        gl={{ antialias: true, alpha: false }}
        onPointerLeave={() => handleHover(null, null)}
      >
        <color attach="background" args={["#080c10"]} />
        <fog attach="fog" args={["#080c10", 22, 42]} />

        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 18, 8]} intensity={1.15} castShadow />
        <directionalLight position={[-10, 10, -8]} intensity={0.35} />
        <pointLight position={[0, 8, 0]} intensity={0.5} color="#39d353" />

        <Suspense fallback={null}>
          <ContributionGrid calendar={calendar} onHover={handleHover} />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.45}
          minDistance={6}
          maxDistance={36}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2.05}
          dampingFactor={0.06}
          enableDamping
          rotateSpeed={0.55}
          zoomSpeed={0.9}
        />
        <PerspectiveCamera makeDefault position={[18, 14, 18]} />
      </Canvas>

      {/* overlay gradient vignette */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#080c10] to-transparent" />

      <ContributionTooltip day={hovered} pos={pos} />

      {/* subtle hint */}
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] tracking-wide text-white/50 backdrop-blur">
        DRAG TO ROTATE · SCROLL TO ZOOM
      </div>
    </div>
  );
}
