"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ContributionScene from "@/components/ContributionScene";
import StatsPanel from "@/components/StatsPanel";
import YearSelector from "@/components/YearSelector";
import LoadingState from "@/components/LoadingState";
import { calculateStats } from "@/lib/stats";
import type { ContributionCalendar, GitHubUser } from "@/types/github";

type ApiResponse = {
  year: number;
  user: GitHubUser | null;
  calendar: ContributionCalendar;
  source: string;
  demo?: boolean;
  error?: string;
};

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<GitHubUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // fetch auth user
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
    // authUser intentionally excluded to avoid re-fetch loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const stats = useMemo(() => {
    if (!data) return null;
    return calculateStats(data.calendar.days);
  }, [data]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthUser(null);
    // reload contributions as demo
    setData(null);
    setLoading(true);
    fetch(`/api/github/contributions?year=${year}`)
      .then((r) => r.json())
      .then((j) => setData(j))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#05080b] text-white">
      <Navbar user={authUser} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* top bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {authUser ? (
                <>
                  <span className="text-white">{authUser.name ?? authUser.login}</span>
                  <span className="ml-2 font-normal text-white/40">@{authUser.login}</span>
                </>
              ) : (
                <span className="text-white">Your contribution landscape</span>
              )}
            </h1>
            <p className="mt-1 text-sm text-white/40">
              {data?.demo
                ? "Demo data — sign in with GitHub to load your real history"
                : `${data?.calendar.days.length ?? 0} days · ${data?.calendar.totalContributions ?? 0} contributions`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <YearSelector year={year} onChange={setYear} />
            {!authUser && authChecked && (
              <a
                href="/api/auth/github"
                className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black hover:bg-white/90"
              >
                Sign in
              </a>
            )}
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-6 py-10 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                !
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white">Couldn&apos;t load contributions</h3>
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
              <p className="mt-4 text-xs text-white/25">
                If rate-limited, wait a minute and retry. We only request read-only access.
              </p>
            </div>
          ) : data && stats ? (
            <>
              <StatsPanel stats={stats} demo={!!data.demo} />

              <div className="mt-6">
                <ContributionScene calendar={data.calendar} />
              </div>

              {/* detail row */}
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="text-xs font-medium tracking-widest text-white/40">HOW TO READ</div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Each column is a day. Height = number of contributions. Weeks run left→right,
                    days Sunday→Saturday front→back. Hover to inspect.
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="text-xs font-medium tracking-widest text-white/40">COLOR SCALE</div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-white/30">less</span>
                    <div className="flex gap-1">
                      <div className="h-4 w-4 rounded bg-[#161b22] border border-white/10" />
                      <div className="h-4 w-4 rounded bg-[#0e4429]" />
                      <div className="h-4 w-4 rounded bg-[#006d32]" />
                      <div className="h-4 w-4 rounded bg-[#26a641]" />
                      <div className="h-4 w-4 rounded bg-[#39d353]" />
                    </div>
                    <span className="text-xs text-white/30">more</span>
                  </div>
                  <p className="mt-2 text-xs text-white/30">Intensity normalized per-year to max daily count.</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="text-xs font-medium tracking-widest text-white/40">PERFORMANCE</div>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    371 columns rendered. Orbit, pan, and zoom are GPU-accelerated. On mobile, use
                    one finger to rotate and pinch to zoom.
                  </p>
                </div>
              </div>

              {data.calendar.days.filter((d) => d.count === 0).length > 300 && (
                <div className="mt-6 rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-200/70">
                  Quiet year — mostly flat terrain. Your next streak will carve fresh peaks.
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
