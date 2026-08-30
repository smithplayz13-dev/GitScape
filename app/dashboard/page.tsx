"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import ContributionWorld from "@/components/3d/ContributionWorld";
import { calculateStats } from "@/lib/stats";
import type { ContributionCalendar, GitHubUser } from "@/types/github";

type ApiResponse = {
  year: number;
  user: GitHubUser | null;
  calendar: ContributionCalendar;
  source: string;
  demo?: boolean;
};

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<GitHubUser | null>(null);

  const [replaying, setReplaying] = useState(false);
  const [revealIndex, setRevealIndex] = useState<number | undefined>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/github/user")
      .then((r) => r.json())
      .then((j) => {
        if (j.authenticated) setAuthUser(j.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setReplaying(false);
    setRevealIndex(undefined);
    if (intervalRef.current) clearInterval(intervalRef.current);
    fetch(`/api/github/contributions?year=${year}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || j.details || `Request failed ${r.status}`);
        return j as ApiResponse;
      })
      .then((j) => {
        if (!cancelled) {
          setData(j);
          if (j.user && !authUser) setAuthUser(j.user);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const stats = useMemo(() => (data ? calculateStats(data.calendar.days) : null), [data]);
  const totalDays = data?.calendar.weeks.flatMap((w) => w.days).length ?? 0;

  useEffect(() => {
    if (!replaying || !data) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (revealIndex === undefined) setRevealIndex(0);
    intervalRef.current = setInterval(() => {
      setRevealIndex((prev) => {
        const next = (prev ?? -1) + 1;
        if (next >= totalDays - 1) {
          setReplaying(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return totalDays - 1;
        }
        return next;
      });
    }, 44);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [replaying, data, totalDays, revealIndex]);

  const progress = revealIndex !== undefined ? (revealIndex + 1) / Math.max(totalDays, 1) : 1;

  return (
    <div className="flex min-h-screen flex-col bg-[#03070d] text-white selection:bg-[#6a4bff]/20">
      {/* minimal top bar — GITSCAPE ... 2026 */}
      <header className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm font-bold tracking-[0.18em] text-white/90">
          GITSCAPE
        </Link>
        <div className="flex items-center gap-3">
          {authUser && <span className="hidden text-xs tracking-wide text-white/30 md:inline">@{authUser.login}</span>}
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="appearance-none rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 pr-7 text-xs font-medium tracking-widest text-white/80 backdrop-blur hover:bg-white/10"
            >
              {Array.from({ length: 6 }, (_, i) => currentYear - i).map((y) => (
                <option key={y} value={y} className="bg-[#03070d]">
                  {y}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40">▾</span>
          </div>
          {!authUser ? (
            <Link href="/api/auth/github" className="rounded-full border border-white/10 px-3.5 py-1 text-xs tracking-wide text-white/60 hover:bg-white hover:text-black">
              CONNECT
            </Link>
          ) : (
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                setAuthUser(null);
                setData(null);
                setLoading(true);
                const r = await fetch(`/api/github/contributions?year=${year}`);
                setData(await r.json());
                setLoading(false);
              }}
              className="text-xs tracking-wide text-white/25 hover:text-white/50"
            >
              SIGN OUT
            </button>
          )}
        </div>
      </header>

      {/* terrain — 80-90% of screen */}
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pb-8 md:px-6">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-24">
            <p className="animate-pulse text-xs font-medium tracking-[0.22em] text-white/70">GENERATING YOUR TERRAIN...</p>
            <div className="mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#6a4bff]/40 to-transparent" />
            <p className="mt-3 text-[11px] tracking-wide text-white/20">Fetching contributions for {year}</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <p className="text-sm tracking-wide text-red-300/80">Failed to generate terrain</p>
            <p className="mt-2 max-w-md text-xs leading-5 text-white/35">{error}</p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetch(`/api/github/contributions?year=${year}`)
                    .then(async (r) => {
                      const j = await r.json();
                      if (!r.ok) throw new Error(j.error ?? "Failed");
                      return j;
                    })
                    .then((j) => setData(j))
                    .catch((e) => setError(e.message))
                    .finally(() => setLoading(false));
                }}
                className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black"
              >
                Retry
              </button>
              <Link href="/api/auth/github" className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/60">
                Re-authenticate
              </Link>
            </div>
          </div>
        ) : data && stats ? (
          <>
            <div className="flex-1">
              <ContributionWorld calendar={data.calendar} replayIndex={revealIndex} cinematic />
              <div className="mt-2 text-center text-[10px] tracking-[0.18em] text-white/18">terrain</div>
            </div>

            {/* minimal typography stats — not cards */}
            <div className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-lg font-light tracking-tight text-white">{data.calendar.totalContributions.toLocaleString()}</div>
                <div className="mt-1 text-[10px] font-medium tracking-[0.16em] text-white/30">CONTRIBUTIONS</div>
              </div>
              <div>
                <div className="text-lg font-light tracking-tight text-white">{stats.currentStreak}</div>
                <div className="mt-1 text-[10px] font-medium tracking-[0.16em] text-white/30">DAY STREAK</div>
              </div>
              <div>
                <div className="text-lg font-light tracking-tight text-white">{stats.longestStreak}</div>
                <div className="mt-1 text-[10px] font-medium tracking-[0.16em] text-white/30">BEST STREAK</div>
              </div>
            </div>
            {data.demo && (
              <div className="mt-3 text-center text-[10px] tracking-wide text-white/20">Demo data — <Link href="/api/auth/github" className="underline decoration-white/15 hover:text-white/40">connect GitHub</Link> for your real terrain</div>
            )}

            {/* REPLAY — minimal */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  if (revealIndex !== undefined && revealIndex >= totalDays - 1 && !replaying) {
                    setRevealIndex(0);
                    setReplaying(true);
                    return;
                  }
                  setReplaying((v) => !v);
                  if (revealIndex === undefined) setRevealIndex(0);
                }}
                className="rounded-full border border-white/12 bg-white/[0.03] px-6 py-2 text-xs font-medium tracking-[0.16em] text-white/80 backdrop-blur hover:bg-white hover:text-black"
              >
                {replaying ? "PAUSE" : "REPLAY"}
              </button>
              {(replaying || revealIndex !== undefined) && (
                <div className="flex w-full max-w-md items-center gap-3">
                  <div className="h-px flex-1 bg-white/10">
                    <div className="h-px bg-gradient-to-r from-[#1a6cff] via-[#c23bff] to-[#ff3b9a] transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>
                  <span className="text-[10px] tracking-widest text-white/25">{year} · {data.calendar.totalContributions.toLocaleString()}</span>
                </div>
              )}
              {revealIndex !== undefined && revealIndex >= totalDays - 1 && !replaying && (
                <div className="text-xs tracking-[0.18em] text-[#c23bff]/70">{year} · {data.calendar.totalContributions.toLocaleString()} contributions — complete</div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
