import Link from "next/link";
import LandingTerrain from "@/components/LandingTerrain";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#03070d] text-white selection:bg-[#6a4bff]/20">
      {/* miniature animated terrain behind hero */}
      <div className="absolute inset-0">
        <LandingTerrain />
      </div>

      {/* header — minimal */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xs font-bold tracking-[0.18em] text-white/80">GITSCAPE</span>
        <Link href="/dashboard" className="text-xs tracking-wide text-white/30 hover:text-white/60">
          DEMO →
        </Link>
      </header>

      {/* hero — experimental data-art minimal */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-6 text-center">
        <div className="text-[11px] font-medium tracking-[0.22em] text-white/30">GITSCAPE</div>

        <h1 className="mx-auto mt-6 max-w-3xl text-[28px] font-light leading-[1.15] tracking-[-0.02em] text-white md:text-[42px]">
          Your GitHub activity,
          <br />
          <span className="font-extralight text-white/85">visualized as a living data terrain.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-[460px] text-xs leading-5 tracking-wide text-white/25">
          Translucent glass tiles form your calendar. Contributions rise as glowing violet–pink structures. An isometric topographic world built from your commits.
        </p>

        <Link
          href="/api/auth/github"
          className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-2.5 text-xs font-semibold tracking-[0.14em] text-black hover:bg-white/90"
        >
          CONNECT GITHUB
        </Link>

        <Link href="/dashboard" className="mt-3 inline-flex items-center text-xs tracking-wide text-white/25 hover:text-white/45">
          Explore demo without signing in →
        </Link>

        {/* legend — ultra minimal */}
        <div className="mt-12 flex items-center gap-2 text-[10px] tracking-[0.12em] text-white/20">
          <span>LESS</span>
          <div className="flex gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#0e2a4a] border border-white/10" />
            <div className="h-2.5 w-2.5 rounded-sm bg-[#1a6cff]/80" />
            <div className="h-2.5 w-2.5 rounded-sm bg-[#6a4bff]/85" />
            <div className="h-2.5 w-2.5 rounded-sm bg-[#c23bff]/90" />
            <div className="h-2.5 w-2.5 rounded-sm bg-[#ff3b9a]" />
          </div>
          <span>MORE</span>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-6 text-center text-[10px] tracking-[0.12em] text-white/12">
        NEAR-BLACK · ELECTRIC BLUE · VIOLET → HOT PINK · GLASS · BLOOM · MINIMAL
      </footer>
    </div>
  );
}
