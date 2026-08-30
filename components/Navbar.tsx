"use client";

import Link from "next/link";

export default function Navbar({
  user,
  onLogout,
}: {
  user?: { login: string; avatarUrl: string; name?: string | null } | null;
  onLogout?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05080b]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[56px] max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-bold tracking-tight text-black">
            GS
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">GitScape</span>
          <span className="hidden text-xs font-medium text-white/30 md:inline">· 3D contributions</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatarUrl} alt={user.login} className="h-7 w-7 rounded-full border border-white/10" />
                <span className="text-sm text-white/80">@{user.login}</span>
              </div>
              <button
                onClick={onLogout}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/api/auth/github"
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-white/90"
            >
              Sign in with GitHub
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
