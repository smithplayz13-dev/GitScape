"use client";

import { useEffect, useState } from "react";

export default function LoadingState() {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + Math.random() * 14));
    }, 320);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#080c10] px-8 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white/60" style={{ animationDuration: "0.9s" }} />
      <p className="mt-5 text-sm font-medium tracking-tight text-white">Building your contribution landscape...</p>
      <p className="mt-1 text-xs text-white/40">Fetching data from GitHub</p>

      <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#26a641] to-[#39d353] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 font-mono text-[10px] tracking-widest text-white/25">
        {"█".repeat(Math.floor(progress / 8))}
        {"░".repeat(12 - Math.floor(progress / 8))}
      </div>
    </div>
  );
}
