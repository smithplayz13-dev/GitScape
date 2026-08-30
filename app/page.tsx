import Link from "next/link";
import LandingWorld from "@/components/LandingWorld";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#05080b] text-white selection:bg-[#39d353]/20">
      {/* cinematic miniature world behind hero */}
      <div className="absolute inset-0">
        <LandingWorld />
      </div>

      {/* top HUD */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-bold tracking-tight text-black">GS</div>
          <span className="text-sm font-bold tracking-[0.14em]">GITSCAPE</span>
        </div>
        <Link
          href="/api/auth/github"
          className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/70 backdrop-blur hover:bg-white hover:text-black md:inline-flex"
        >
          SIGN IN
        </Link>
      </header>

      {/* hero — cinematic */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#39d353]/15 bg-[#39d353]/[0.06] px-3 py-1 text-[11px] tracking-[0.12em] text-[#39d353] backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#39d353] shadow-[0_0_8px_rgba(57,211,83,0.85)]" />
          FUTURISTIC CITY GENERATED FROM COMMITS
        </div>

        <h1 className="mt-7 text-[48px] font-black leading-[0.9] tracking-[-0.05em] md:text-[84px]">GITSCAPE</h1>
        <p className="mt-3 text-[15px] font-medium tracking-[0.08em] text-white/55 md:text-[13px] md:tracking-[0.18em]">
          YOUR GITHUB ACTIVITY, RENDERED AS A WORLD.
        </p>

        <p className="mx-auto mt-6 max-w-[560px] text-[13px] leading-6 text-white/38">
          Not a chart. A city. Weeks are blocks, days are plots — your year of work extruded into towers,
          terrain, and constellations. Tilt, orbit, and hover to explore.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/api/auth/github"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold tracking-wide text-black shadow-[0_10px_30px_rgba(255,255,255,0.18)] hover:bg-white/90"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.53 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.88.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            VIEW MY GITHUB
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold tracking-wide text-white/80 backdrop-blur hover:bg-white/[0.08] hover:text-white"
          >
            EXPLORE DEMO →
          </Link>
        </div>

        <div className="mt-6 text-xs tracking-wide text-white/25">
          READ-ONLY · MINIMAL SCOPE · <Link href="/dashboard" className="underline decoration-white/15 hover:text-white/50">TRY WITHOUT SIGNING IN</Link>
        </div>

        {/* mode preview pill */}
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/35 px-1 py-1 backdrop-blur">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold tracking-widest text-black">CITY</span>
          <span className="px-2 text-xs tracking-widest text-white/30">TERRAIN</span>
          <span className="px-2 text-xs tracking-widest text-white/30">GALAXY</span>
          <span className="ml-2 mr-2 text-[10px] tracking-[0.14em] text-white/20">MODES IN DASHBOARD</span>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-6 text-center text-[11px] tracking-wide text-white/18">
        NEARLY BLACK · ATMOSPHERIC DEPTH · EMISSIVE NEON · CINEMATIC CAMERA — BUILT FOR “HOLY SHIT, THAT&apos;S MY GITHUB.”
      </footer>
    </div>
  );
}
