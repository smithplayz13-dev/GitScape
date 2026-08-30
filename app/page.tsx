import Link from "next/link";
import HeroDemo from "@/components/HeroDemo";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#05080b] text-white selection:bg-white/20">
      {/* background demo */}
      <div className="absolute inset-0">
        <HeroDemo />
      </div>

      {/* top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-black">
            GS
          </div>
          <span className="text-sm font-semibold tracking-tight">GitScape</span>
        </div>
        <Link
          href="/api/auth/github"
          className="hidden rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur hover:bg-white hover:text-black md:inline-flex"
        >
          Sign in with GitHub
        </Link>
      </header>

      {/* hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] tracking-wide text-white/60 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-[#39d353] shadow-[0_0_8px_rgba(57,211,83,0.7)]" />
          Interactive 3D contribution explorer
        </div>

        <h1 className="mt-6 text-[42px] font-[700] leading-[0.95] tracking-[-0.04em] md:text-[64px]">
          GitScape
        </h1>
        <p className="mt-3 text-[18px] font-medium tracking-tight text-white/70 md:text-[22px]">
          Your GitHub activity, in 3D.
        </p>

        <p className="mx-auto mt-5 max-w-[560px] text-[14px] leading-6 text-white/45">
          GitHub shows contributions as a flat heatmap. GitScape extrudes every day into a
          luminous column — taller where you shipped more. Spin, zoom, and hover to explore a year
          of work as a landscape.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/api/auth/github"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black shadow-[0_8px_24px_rgba(255,255,255,0.15)] hover:bg-white/90"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.53 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.88.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View my GitHub
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/80 backdrop-blur hover:bg-white/[0.08] hover:text-white"
          >
            Explore demo →
          </Link>
        </div>

        <div className="mt-6 text-xs text-white/30">
          No spam. Read-only access.{" "}
          <Link href="/dashboard" className="underline decoration-white/20 hover:text-white/60">
            Try without signing in
          </Link>
        </div>

        {/* legend */}
        <div className="mt-10 flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/30 px-4 py-2 backdrop-blur">
          <span className="text-[11px] tracking-wide text-white/40">LESS</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-[#161b22] border border-white/10" />
            <div className="h-3 w-3 rounded-sm bg-[#0e4429]" />
            <div className="h-3 w-3 rounded-sm bg-[#006d32]" />
            <div className="h-3 w-3 rounded-sm bg-[#26a641]" />
            <div className="h-3 w-3 rounded-sm bg-[#39d353]" />
          </div>
          <span className="text-[11px] tracking-wide text-white/40">MORE</span>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-6 text-center text-[11px] text-white/20">
        Built for developers who love data. Dark, minimal, futuristic — GitHub meets Vercel meets Linear.
      </footer>
    </div>
  );
}
