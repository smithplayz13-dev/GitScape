"use client";

import type { WorldMode } from "@/types/github";

const modes: { id: WorldMode; label: string }[] = [
  { id: "city", label: "CITY" },
  { id: "terrain", label: "TERRAIN" },
  { id: "galaxy", label: "GALAXY" },
];

export default function VisualizationSwitcher({
  mode,
  onChange,
}: {
  mode: WorldMode;
  onChange: (m: WorldMode) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`rounded-full px-3.5 py-1 text-xs font-semibold tracking-widest transition ${
            mode === m.id
              ? "bg-white text-black shadow"
              : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
