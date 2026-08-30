"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { ContributionCalendar, WorldMode } from "@/types/github";
import Environment from "./Environment";
import DataTerrain from "./DataTerrain";
import ContributionCity from "./ContributionCity";
import ContributionTerrain from "./ContributionTerrain";
import ContributionGalaxy from "./ContributionGalaxy";
import CinematicCamera from "./CinematicCamera";

type Props = {
  calendar: ContributionCalendar;
  mode?: WorldMode;
  replayIndex?: number;
  cinematic?: boolean;
};

export default function ContributionWorld({ calendar, mode = "city", replayIndex, cinematic = true }: Props) {
  // Spec wants terrain as primary — map city default to terrain data-art
  const effectiveMode: WorldMode = mode === "city" ? "terrain" : mode;

  return (
    <div className="relative w-full overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#03070d] min-h-[520px] h-[62vh] md:h-[64vh]">
      <Canvas
        shadows
        dpr={[1, 1.9]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: [19.5, 13.8, 18.2], fov: 34 }}
        onPointerLeave={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <Environment />
        <Suspense fallback={null}>
          {effectiveMode === "terrain" && <DataTerrain calendar={calendar} revealIndex={replayIndex} />}
          {effectiveMode === "galaxy" && <ContributionGalaxy calendar={calendar} />}
          {/* keep city available via explicit mode but not default — hidden behind terrain alias */}
          {mode === "city" && false && <ContributionCity calendar={calendar} onHover={() => {}} revealIndex={replayIndex} />}
          {/* legacy terrain component fallback (not used now) */}
          {false && <ContributionTerrain calendar={calendar} />}
        </Suspense>

        <CinematicCamera autoPlay={cinematic} />

        {/* bloom for pink/purple glow — towers must emit light beyond geometry */}
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.82} luminanceThreshold={0.16} luminanceSmoothing={0.85} radius={0.48} mipmapBlur />
        </EffectComposer>
      </Canvas>

      {/* vignette + bottom fade */}
      <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-white/[0.04]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#03070d] via-[#03070d]/45 to-transparent" />

      {/* hint */}
      <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] tracking-widest text-white/35 backdrop-blur md:flex">
        <span className="h-1 w-1 rounded-full bg-[#6a4bff]" />
        DRAG · SCROLL · SHIFT+DRAG TO PAN
      </div>
    </div>
  );
}
