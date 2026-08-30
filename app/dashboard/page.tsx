"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import ContributionWorld from "@/components/3d/ContributionWorld";
import VisualizationSwitcher from "@/components/ui/VisualizationSwitcher";
import YearSelector from "@/components/ui/YearSelector";
import HUD from "@/components/ui/HUD";
import ReplayControls from "@/components/ui/ReplayControls";
import { calculateStats } from "@/lib/stats";
import type { ContributionCalendar, GitHubUser, WorldMode } from "@/types/github";

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
  const [mode, setMode] = useState<WorldMode>("city");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<GitHubUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Replay state
  const [replaying, setReplaying] = useState(false);
  const [revealIndex, setRevealIndex] = useState<number | undefined>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/github/user")
      .then((r) => r.json())
      .then((j) => {
        if (j.authenticated) setAuthUser(j.user);
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
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

  // Replay logic
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
    }, 42); // cinematic construction speed
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [replaying, data, totalDays, revealIndex]);

  const handleToggleReplay = () => {
    if (!data) return;
    if (revealIndex !== undefined && revealIndex >= totalDays - 1 && !replaying) {
      // restart
      setRevealIndex(0);
      setReplaying(true);
      return;
    }
    if (replaying) setReplaying(false);
    else {
      if (revealIndex === undefined) setRevealIndex(0);
      setReplaying(true);
    }
  };
  const handleSkip = () => {
    setRevealIndex(totalDays - 1);
    setReplaying(false);
  };
  const handleReset = () => {
    setRevealIndex(undefined);
    setReplaying(false);
  };

  const progress = revealIndex !== undefined ? (revealIndex + 1) / Math.max(totalDays, 1) : 1;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null);
    setData(null);
    setLoading(true);
    fetch(`/api/github/contributions?year=${year}`)
      .then((r) => r.json())
      .then((j) => setData(j))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#05080b] text-white">
      <Navbar user={authUser} onLogout={handleLogout} />

      {/* cinematic top HUD */}
      <div className="relative flex-1">
        <div className="mx-auto flex max-w-[1600px] flex-col px-4 pb-6 pt-4 md:px-6">
          {/* HUD bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tracking-[0.12em] text-white">GITSCAPE</span>
              <span className="hidden text-xs tracking-widest text-white/25 md:inline">— {year} WORLD</span>
              {authUser && <span className="text-xs text-white/40">@{authUser.login}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <VisualizationSwitcher mode={mode} onChange={setMode} />
              <YearSelector year={year} onChange={setYear} />
              {!authUser && authChecked && (
                <a
                  href="/api/auth/github"
                  className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-white/90"
                >
                  Sign in
                </a>
              )}
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="rounded-[20px] border border-white/[0.06] bg-[#080c10] px-8 py-16">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#39d353]" style={{ animationDuration: "0.9s" }} />
                  <p className="mt-5 text-sm font-medium tracking-[0.14em] text-white">BUILDING YOUR WORLD...</p>
                  <p className="mt-1 text-xs tracking-widest text-white/30">CONSTRUCTING CITY FROM CONTRIBUTIONS</p>
                  <div className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#26a641] to-[#39d353]" style={{ width: "68%" }} />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-[20px] border border-red-500/20 bg-red-500/[0.06] px-6 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400">!</div>
                <h3 className="mt-3 text-sm font-semibold tracking-wide text-white">WORLD FAILED TO INITIALIZE</h3>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-white/50">{error}</p>
                <div className="mt-4 flex justify-center gap-2">
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
                    className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black"
                  >
                    Retry
                  </button>
                  <a
                    href="/api/auth/github"
                    className="rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 hover:bg-white/5"
                  >
                    Re-authenticate
                  </a>
                </div>
              </div>
            ) : data && stats ? (
              <>
                {/* THE WORLD — hero */}
                <ContributionWorld
                  calendar={data.calendar}
                  mode={mode}
                  replayIndex={revealIndex}
                  cinematic
                />

                {/* bottom HUD — stats + replay */}
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
                    <HUD stats={stats} totalContributions={data.calendar.totalContributions} year={year} />
                    <div className="flex items-center gap-2 text-[10px] tracking-widest text-white/25">
                      <span>{mode.toUpperCase()} MODE</span>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span>{data.demo ? "DEMO · SIGN IN FOR REAL DATA" : "LIVE GITHUB DATA"}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 backdrop-blur md:px-6">
                    <ReplayControls
                      playing={replaying}
                      progress={progress}
                      onToggle={handleToggleReplay}
                      onSkip={handleSkip}
                      onReset={handleReset}
                      year={year}
                      total={data.calendar.totalContributions}
                    />
                    {revealIndex !== undefined && revealIndex >= totalDays - 1 && !replaying && (
                      <div className="mt-3 text-center text-xs tracking-[0.18em] text-[#39d353]">
                        {year} · {data.calendar.totalContributions.toLocaleString()} CONTRIBUTIONS — WORLD COMPLETE
                      </div>
                    )}
                  </div>

                  {/* quiet year subtle message */}
                  {data.calendar.days.filter((d) => d.count === 0).length > 310 && mode === "city" && (
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-center text-xs tracking-wide text-white/30">
                      Quiet year — vast empty districts. Your next streak will light new blocks.
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* footer subtle */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
    </div>
  );
}
