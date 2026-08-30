"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import type { ContributionCalendar, ContributionDay, WorldMode } from "@/types/github";
import Environment from "./Environment";
import ContributionCity from "./ContributionCity";
import ContributionTerrain from "./ContributionTerrain";
import ContributionGalaxy from "./ContributionGalaxy";

type Props = {
  calendar: ContributionCalendar;
  mode: WorldMode;
  replayIndex?: number;
  onHover?: (day: ContributionDay | null) => void;
  cinematic?: boolean;
};

export default function ContributionWorld({ calendar, mode, replayIndex, cinematic = true }: Props) {
  const [hovered, setHovered] = useState<ContributionDay | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const handleHover = (day: ContributionDay | null, p: { x: number; y: number } | null) => {
    setHovered(day);
    setPos(p);
  };

  // Reset hover when mode changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHovered(null);
    setPos(null);
  }, [mode]);

  const height = cinematic ? "min-h-[520px] h-[62vh] md:h-[64vh]" : "h-[420px] md:h-[520px]";

  return (
    <div className={`relative w-full overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#05080b] ${height}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: cinematic ? [19, 13.5, 17.5] : [18, 14, 18], fov: 34 }}
        onPointerLeave={() => handleHover(null, null)}
      >
        <Environment />
        <Suspense fallback={null}>
          {mode === "city" && <ContributionCity calendar={calendar} onHover={handleHover} revealIndex={replayIndex} />}
          {mode === "terrain" && <ContributionTerrain calendar={calendar} />}
          {mode === "galaxy" && <ContributionGalaxy calendar={calendar} />}
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={6}
          maxDistance={42}
          minPolarAngle={0.12}
          maxPolarAngle={Math.PI / 2.08}
          dampingFactor={0.065}
          enableDamping
          rotateSpeed={0.52}
          zoomSpeed={0.92}
          panSpeed={0.62}
        />
        <PerspectiveCamera makeDefault position={cinematic ? [19, 13.5, 17.5] : [18, 14, 18]} fov={34} />
      </Canvas>

      {/* vignette + bottom HUD gradient */}
      <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-white/[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#05080b] via-[#05080b]/35 to-transparent" />

      {/* hover tooltip — futuristic HUD style */}
      {hovered && pos && mode === "city" && (
        <FuturisticTooltip day={hovered} pos={pos} />
      )}

      {/* hint */}
      <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] tracking-widest text-white/45 backdrop-blur md:flex">
        <span className="h-1 w-1 rounded-full bg-[#39d353]" />
        DRAG · SCROLL · SHIFT+DRAG TO PAN
      </div>
    </div>
  );
}

function FuturisticTooltip({ day, pos }: { day: ContributionDay; pos: { x: number; y: number } }) {
  const date = new Date(day.date + "T00:00:00");
  const formatted = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const label = day.count === 1 ? "1 contribution" : `${day.count} contributions`;
  const x = Math.min(pos.x + 14, typeof window !== "undefined" ? window.innerWidth - 200 : pos.x + 14);
  const y = Math.max(pos.y - 62, 8);
  return (
    <div
      className="pointer-events-none fixed z-50 min-w-[150px] rounded-xl border border-[#39d353]/20 bg-[#0a1310]/95 px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(57,211,83,0.12)] backdrop-blur-xl"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-[5px] w-[5px] rounded-full bg-[#39d353] shadow-[0_0_6px_rgba(57,211,83,0.9)]" />
        <span className="text-[10px] font-semibold tracking-widest text-[#39d353]">DAY</span>
      </div>
      <div className="mt-1 text-xs font-medium text-white/95">{formatted}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-xs">
        <span className={day.count === 0 ? "text-white/35" : "text-[#39d353]"}>{label}</span>
        <span className="text-white/20">·</span>
        <span className="text-white/40">{day.level === 0 ? "empty" : `intensity ${day.level}/4`}</span>
      </div>
      <div className="mt-1.5 h-px w-full bg-gradient-to-r from-[#39d353]/30 via-[#39d353]/10 to-transparent" />
    </div>
  );
}
