"use client";

type Props = {
  playing: boolean;
  progress: number; // 0-1
  onToggle: () => void;
  onSkip: () => void;
  onReset: () => void;
  year: number;
  total: number;
};

export default function ReplayControls({ playing, progress, onToggle, onSkip, onReset, year, total }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-2 rounded-full bg-[#39d353] px-5 py-2 text-xs font-bold tracking-widest text-black hover:bg-[#2fbe45]"
        >
          <span className={`h-2 w-2 rounded-full bg-black ${playing ? "animate-pulse" : ""}`} />
          {playing ? "PAUSE" : "REPLAY YEAR"}
        </button>
        <button
          onClick={onSkip}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold tracking-widest text-white/70 backdrop-blur hover:bg-white/10 hover:text-white"
        >
          SKIP →
        </button>
        <button
          onClick={onReset}
          className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/40 hover:text-white/70"
        >
          RESET
        </button>
      </div>

      <div className="flex w-full max-w-xl items-center gap-3">
        <span className="text-[11px] tracking-widest text-white/30">{year}</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#26a641] to-[#39d353] transition-all duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <span className="text-[11px] tracking-widest text-white/50">{total.toLocaleString()} contributions</span>
      </div>
    </div>
  );
}
